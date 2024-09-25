import styles from './cardContainer.module.css';
import { useContext, useState, useRef, useEffect } from 'react';
import {
	Button, Dialog, DialogBody, DialogFooter, Divider, Intent, OverlayToaster, Position, Spinner,
} from '@blueprintjs/core';
import { ArrowDown } from '@/components/icons';
import { CardContainerProps, CardContainerTheme } from '@/components/toolKitPanel/types.ts';
import { useAppSelector } from '@/store/hooks.ts';
import { getToken } from '@/store/userSlice.ts';
import { AIFilterApi } from '@/api';
import { exportBase64FromCanvas, readImage } from '@/common/utils/image.tsx';
import { int, isBase64 } from '@/common/utils/tools.ts';
import MySlider from '../../formComponents/slider';
import MyRadio from '@/components/formComponents/radio';
import MySelect from '@/components/formComponents/select';
import MyTextArea from '@/components/formComponents/textarea';
import MySwitch from '@/components/formComponents/switch';
import { ServiceModelOptions, ModelFormDataType } from '@/common/types/AIServices.ts';

import { InferenceSession, Tensor } from 'onnxruntime-web';
import { handleImageScale } from '../../helpers/scaleHelper.tsx';
import { modelScaleProps } from '../../helpers/Interfaces.tsx';
import { onnxMaskToImage, applyMaskToImage } from '../../helpers/maskUtils.tsx';
import { modelData } from '../../helpers/onnxModelAPI.tsx';
import SegContext from '../../hooks/createContext.tsx';
import { modelInputProps } from '../../helpers/Interfaces.tsx';
import * as _ from 'underscore';
import SegContextProvider from '../../hooks/context.tsx';

const ort = require('onnxruntime-web');


export default function SegmentCard(props: CardContainerProps): JSX.Element {
	const theme: CardContainerTheme = {
		header: { background: props.headerColor },
		body: { background: props.bodyColor },
	};
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const store = props.store;


	/* Panel */
	// { param: value }
	const [formData, setFormData] = useState<{ [propName: string]: ModelFormDataType }>({});
	// render ui
	const [formState, setFormState] = useState<ServiceModelOptions>({});
	const [paramOrder, setParamOrder] = useState<Array<string>>([]);
	useEffect(() => {
		console.log('init Seg card.');
		console.log(props);

		// segregate/init formData
		const tmp: { [propName: string]: ModelFormDataType } = {};
		for (const key in props.model) {
			tmp[key] = props.model[key]['default'];
		}

		setFormData(tmp);
		setFormState(props.model);
	}, []);

	/* Dialog */
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [isDialogLoading, setIsDialogLoading] = useState<boolean>(false);

	const IconWrapper: JSX.Element = (
		<div className={styles.dialogIcon}>
			{props.headerIcon}
		</div>
	);
	const dialogProps = {
		canEscapeKeyClose: false,
		canOutsideClickClose: false,
		isCloseButtonShown: false,
		icon: IconWrapper,
		title: props.toolKitTitle,
		isOpen: isDialogOpen,
	};

	const [originalSrc, setOriginalSrc] = useState<string>('');
	const [processedSrc, setProcessedSrc] = useState<string>('');
	const [canvasWH, setCanvasWH] = useState({ width: '100%', height: '100%' });

	const imageRef = useRef(null);

	// set canvas based on image size
	async function measureCanvasWH(): Promise<void> {
		if (imageRef.current !== null) {
			const canvasW     = imageRef.current.clientWidth,
				  canvasH     = imageRef.current.clientHeight,
				  canvasRatio = canvasW / canvasH; // > 1
			const image: HTMLImageElement = await readImage(originalSrc);
			const imageW     = image.width,
				  imageH     = image.height,
				  imageRatio = imageW / imageH;

			let w: number, h: number;
			if (imageRatio > 1) { // w > h
				if (imageRatio <= canvasRatio) {
					h = canvasH;
					w = h * imageRatio;
				} else {
					w = canvasW;
					h = w / imageRatio;
				}
			} else if (imageRatio === 1) { // w === h
				w = h = canvasH;
			} else { // w < h
				h = canvasH;
				w = h * imageRatio;
			}
			setCanvasWH({
				width: int(w) + 'px',
				height: int(h) + 'px',
			});
		}
	}

	/* Control Dialog */
	async function showDialog() {
		if (store.selectedElements[0] === undefined) {
			OverlayToaster.create({ position: Position.TOP })
				.show({
					message: <p>select an image</p>, intent: Intent.DANGER,
				});
		} else {
			setIsDialogOpen(true);

			const src = await exportBase64FromCanvas(store);
			setOriginalSrc(src);
		}
	}

	function clearDialog(): void {
		setIsDialogOpen(false);
		setIsDialogLoading(false);
		setOriginalSrc('');
		setProcessedSrc('');
		setShowRunBtn(true);
		setStartSegment(false);
		setSelectedMaskImg(null);
	}


	const selector = useAppSelector;
	const token: string = selector(getToken);
	const [showRunBtn, setShowRunBtn] = useState<boolean>(true);
	const [startSegment, setStartSegment] = useState<boolean>(false);
	const [numpyArray, setNumpyArray] = useState(null);


	async function handleRunBtn(): Promise<void> {
		props.runBtnHandler && props.runBtnHandler();
		setIsDialogLoading(true);
		await measureCanvasWH();

		const params: { [propName: string]: ModelFormDataType } = {};
		Object.keys(formData).forEach((key: string) => {
			params[key] = formData[key];
		});
		console.log('Image source.');

		const res = await AIFilterApi({
			image_url: originalSrc,
			service_name: props.serviceName,
			modelParams: params,
		});
		if (res.data.result) {
			setTaskSucceed(true);
			// Parse the JSON data into a JavaScript object
			const numpyArray = JSON.parse(res.data.result);
			const shape = [1, 256, 64, 64];
			console.log('Shape of numpyArray:', shape);
			console.log(numpyArray);
			setNumpyArray(numpyArray);
			setStartSegment(true);
		} else {
			OverlayToaster.create({ position: Position.TOP })
				.show({
					message: <p>The server is busy, please try it later.</p>, intent: Intent.DANGER,
				});
			setTaskSucceed(false);
		}
		setIsDialogLoading(false);
		setShowRunBtn(false);
	}

	function createImageElement(url: string, isCrossOrigin: boolean): HTMLImageElement {
		const img = new Image();
		if (isCrossOrigin) {
			img.crossOrigin = 'anonymous'; // Set the cross-origin attribute
		}
		img.src = url;
		return img;
	}

	// cross-origin
	const originalImage = createImageElement(originalSrc, !isBase64(originalSrc));


	function handleApplyBtn(): void {
		props.applyBtnHandler && props.applyBtnHandler();

		const axis = store.selectedElements[0];
		store.activePage.addElement({
			type: 'image',
			src: applyMaskToImage(originalImage, selectedMaskImg).src,
			x: axis.x + 50,
			y: axis.y + 50,
			width: axis.width,
			height: axis.height,
		});

		clearDialog();
	}

	function handleCancelBtn(): void {
		props.cancelBtnHandler && props.cancelBtnHandler();
		clearDialog();
	}

	const [selectedMaskImg, setSelectedMaskImg] = useState<HTMLImageElement>(null);
	// Define image, embedding and model paths
	const MODEL_DIR: string = './_next/static/chunks/pages/sam_onnx_decoder.onnx';
	/* Segment Anything */
	const Seg = () => {
		const {
				  clicks: [clicks, setClicks],
				  image: [img, setImage],
				  maskImg: [maskImg, setMaskImg],
			  } = useContext(SegContext)!;

		const getClick = (x: number, y: number): modelInputProps => {
			const clickType = 1;
			return { x, y, clickType };
		};

		const handleMouseMove = _.throttle((e: any) => {
			let el = e.nativeEvent.target;
			const rect = el.getBoundingClientRect();
			let x = e.clientX - rect.left;
			let y = e.clientY - rect.top;
			const imageScale = img ? img.width / el.offsetWidth : 1;
			x *= imageScale;
			y *= imageScale;
			const click = getClick(x, y);
			console.log('click is');
			console.log(click);
			if (click) setClicks([click]);
		}, 15);

		const handleMouseClick = _.throttle((e: any) => {
			setSelectedMaskImg(maskImg);
		}, 15);


		const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
		const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor

		// The ONNX model expects the input to be rescaled to 1024. 
		// The modelScale state variable keeps track of the scale values.
		const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

		// Initialize the ONNX model. load the image, and load the SAM
		// pre-computed image embedding
		useEffect(() => {
			// Initialize the ONNX model
			const initModel = async () => {
				try {
					if (MODEL_DIR === undefined) return;
					const URL: string = MODEL_DIR;
					const model = await ort.InferenceSession.create(URL);
					setModel(model);
					console.log('Success model!');
				} catch (e) {
					console.log(e);
				}
			};
			initModel();

			// Load the image
			console.log('Loading image...');
			const url = new URL(originalSrc, location.origin);
			loadImage(url);

			// Define the shape of npy array
			const shape = [1, 256, 64, 64];
			// Load the Segment Anything pre-computed embedding
			Promise.resolve(loadNpyTensor(numpyArray, shape, 'float32'))
				.then((embedding) => setTensor(embedding));
		}, []);

		const loadImage = async (url: URL) => {
			try {
				const i = new Image();
				i.src = url.href;
				i.onload = () => {
					const { height, width, samScale } = handleImageScale(i);
					setModelScale({
						height: height,  // original image height
						width: width,  // original image width
						samScale: samScale, // scaling factor for image which has been resized to longest side 1024
					});
					i.width = width;
					i.height = height;
					setImage(i);
				};
			} catch (error) {
				console.log(error);
			}
		};

		// Convert npy array into a tensor. 
		const loadNpyTensor = async (npyArray: number[][][][], shape: number[], dType: string) => {
			const float32Array = new Float32Array(npyArray.flat(3));
			const tensor = new ort.Tensor(dType, float32Array, shape);
			return tensor;
		};
		console.log(tensor);
		console.log('check tensor!');
		console.log(modelScale);
		console.log('modelScale');
		console.log(clicks);
		console.log('clicks');
		// Run the ONNX model every time clicks has changed
		useEffect(() => {
			runONNX();
		}, [clicks]);


		const runONNX = async () => {
			try {
				if (
					model === null ||
					clicks === null ||
					tensor === null ||
					modelScale === null
				) {
					console.log('checking settings');
					console.log(model);
					console.log(clicks);
					console.log(tensor);
					console.group(modelScale);
					return;
				} else {
					// Prepare the model input in the correct format for SAM.
					// The modelData function is from onnxModelAPI.tsx.
					const feeds = modelData({
						clicks,
						tensor,
						modelScale,
					});
					if (feeds === undefined) return;
					console.log('We are running!');
					// Run the SAM ONNX model with the feeds returned from modelData()
					const results = await model.run(feeds);
					const output = results[model.outputNames[0]];
					console.log(output);
					console.log('Get output');
					// The predicted mask returned from the ONNX model is an array which is
					// rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
					setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
					console.log(maskImg);
					console.log('Set Mask Image');
				}
			} catch (e) {
				console.log(e);
			}
		};

		return (
			<div className={styles.canvas} ref={imageRef}
				 style={{ width: canvasWH.width, height: canvasWH.height }}>
				{
					originalSrc && !processedSrc &&
					<img onMouseMove={handleMouseMove}
						 onMouseOut={() => _.defer(() => setMaskImg(null))}
						 onTouchStart={handleMouseMove}
						 onClick={handleMouseClick}
						 src={originalSrc}
						 className={styles.display}
					/>
				}
				{
					maskImg &&
					<img src={maskImg.src}
						 className={styles.mask} />

				}
				{
					selectedMaskImg &&
					<img src={selectedMaskImg.src}
						 className={`${styles.mask} ${styles.selectedMask}`} />

				}

			</div>
		);
	};

	const [taskSucceed, setTaskSucceed] = useState<boolean>(undefined);

	const footerActions: JSX.Element = (
		<>

			{showRunBtn ?
			 <Button onClick={handleRunBtn} loading={isDialogLoading}>Segment</Button> : (taskSucceed &&
					<Button onClick={handleApplyBtn}>Apply</Button>)
			}
			<Button onClick={handleCancelBtn}>Cancel</Button>
		</>
	);

	function handleServiceAvl() {
		OverlayToaster.create({ position: Position.TOP })
			.show({
				message: <><p>You do not have permission to use this service.</p><p>Please contact admin.</p></>,
				intent: Intent.DANGER,
			});
	}


	return (
		<>
			<div className={styles.wrapper}>
				<div className={styles.header} style={theme.header} onClick={() => setIsOpen(!isOpen)}>
					<div className={styles.headerIcon}>{props.headerIcon}</div>
					<div className={styles.title}>{props.toolKitTitle}</div>
					<div className={isOpen ? styles.arrowUp : styles.arrowDown}>
						{ArrowDown}
					</div>
				</div>


				{isOpen &&
					<div className={styles.body} style={theme.body}>
						{paramOrder.length > 1 &&
							<>
								{paramOrder.map((key, idx) => {
										return (
											<div key={idx}>
												{formState[key]['ui:widget'] === 'range' &&
													<MySlider {...formState[key]}
															  onChange={(val: any) => {
																  formData[key] = val;
																  console.log('range', formData[key]);
															  }}
													/>
												}
												{formState[key]['ui:widget'] === 'radio' &&
													<MyRadio {...formState[key]}
															 onChange={(val: any) => {
																 formData[key] = val;
																 console.log('radio', formData[key]);
															 }}
													/>
												}
												{formState[key]['ui:widget'] === 'select' &&
													<MySelect {...formState[key]}
															  onChange={(val: any) => {
																  formData[key] = val;
																  console.log('select', formData[key]);
															  }}
													/>
												}
												{formState[key]['ui:widget'] === 'textarea' &&
													<MyTextArea {...formState[key]}
																onChange={(val: any) => {
																	formData[key] = val;
																	console.log('textarea', formData[key]);
																}}
													/>
												}
												{formState[key]['ui:widget'] === 'switch' &&
													<MySwitch {...formState[key]}
															  onChange={(val: any) => {
																  formData[key] = val;
																  console.log('switch', formData[key]);
															  }}
													/>
												}
											</div>);
									},
								)}
								<Divider />
							</>
						}
						{!props.serviceAvl && <div className={styles.mask} onClick={handleServiceAvl}></div>}
						<Button className={styles.runBtn} onClick={showDialog}>Run</Button>
					</div>
				}

			</div>

			<Dialog {...dialogProps} className={styles.dialogWrapper}>
				<DialogBody className={styles.dialogBody}>

					{!startSegment &&
						<div className={styles.canvas} ref={imageRef}
							 style={{ width: canvasWH.width, height: canvasWH.height }}>
							{
								originalSrc && !processedSrc &&
								<img src={originalSrc}
									 className={styles.display}
								/>
							}</div>
					}

					{startSegment &&
						<SegContextProvider>
							<Seg />
						</SegContextProvider>
					}

					{isDialogLoading &&
						<div className={styles.spinnerMask}>
							<Spinner className={styles.spinner} />
						</div>
					}

				</DialogBody>

				<DialogFooter actions={footerActions} />
			</Dialog>
		</>
	);
}