import styles from './cardContainer.module.css';
import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
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
import MyNumericInput from '@/components/formComponents/numericInput';
import MyFileInput from '@/components/formComponents/file';


const CardContainer = forwardRef((props: CardContainerProps, ref): JSX.Element => {
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
		// segregate / init formData
		const tmp: { [propName: string]: ModelFormDataType } = {};
		for (const key in props.model) {
			tmp[key] = props.model[key]['default'];
		}

		setFormData(tmp);
		setFormState(props.model);
		setParamOrder('ui:order' in props.settings ? props.settings['ui:order'] : Object.keys(props.model));
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

	/** MouseMove Event **/
	const [sliderPos, setSliderPos] = useState<number>(50);
	const [sliderBound, setSliderBound] = useState({ left: 0, right: 0 });

	function watchMouseMove(e: any): void {
		if (e.clientX > sliderBound.left && e.clientX < sliderBound.right) {
			const tmp = int((e.clientX + 2 - sliderBound.left) / (sliderBound.right - sliderBound.left) * 100);
			setSliderPos(tmp);
		}
	}

	const [originalSrc, setOriginalSrc] = useState<string>('');
	const [processedSrc, setProcessedSrc] = useState<string>('');
	const [canvasWH, setCanvasWH] = useState({ width: '100%', height: '100%' });

	const imageRef = useRef(null);

	useEffect((): void => {
		if (imageRef && imageRef?.current) {
			const imageRefBox = imageRef?.current?.getBoundingClientRect();
			setSliderBound({
				left: int(imageRefBox.left),
				right: int(imageRefBox.right),
			});
		}
	}, [canvasWH]);

	async function measureCanvasWH(): Promise<Array<number>> {
		if (imageRef.current !== null) {
			const canvasW = imageRef.current.clientWidth,
				canvasH = imageRef.current.clientHeight,
				canvasRatio = canvasW / canvasH; // > 1
			const image: HTMLImageElement = await readImage(originalSrc);
			const imageW = image.width,
				imageH = image.height,
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
			return [int(w), int(h)];
		}
	}

	// const clearFileInputs = () => {
	// 	paramOrder.forEach((key) => {
	// 		if (refs.current[key]) {
	// 			refs.current[key].clearInput();
	// 		}
	// 	});
	// };

	// useImperativeHandle(ref, () => ({
	// 	clearFileInputs,
	// }));

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
			const img = await readImage(src);
			setOriImg(img);
		}
	}

	function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (file.name.endsWith('.cube')) {
                const text = reader.result as string;
                // TextEncoder to handle non-ASCII characters
                const encoder = new TextEncoder();
                const uint8Array = encoder.encode(text);

                let binaryString = '';
                for (let i = 0; i < uint8Array.length; i += 10000) {
                    binaryString += String.fromCharCode.apply(null, uint8Array.slice(i, i + 10000));
                }

                const base64 = window.btoa(binaryString);
                resolve(`data:@file/octet-stream;base64,${base64}`);

                formData['style_lut'] = `data:@file/octet-stream;base64,${base64}`;
                console.log("style lut base64:", formData['style_lut']);
            } else {
                resolve(reader.result as string);
                console.log('Image file detected. Data URL:', reader.result);
                formData['style_image'] = reader.result as string;
            }
        };

        reader.onerror = (error) => reject(error);
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else if (file.name.endsWith('.cube')) {
            reader.readAsText(file);  
        } else {
            reject(new Error("Unsupported file type"));
        }
    });
}

	
	function clearDialog(): void {
		setIsDialogOpen(false);
		setOriginalSrc('');
		setProcessedSrc('');
		setSliderPos(50);
		setShowRunBtn(true);
	}


	const selector = useAppSelector;
	const token: string = selector(getToken);
	const [showRunBtn, setShowRunBtn] = useState<boolean>(true);

	async function handleRunBtn(): Promise<void> {
		props.runBtnHandler && props.runBtnHandler();
		setIsDialogLoading(true);
		console.log("dialog is loading");
		const [w, h] = await measureCanvasWH();

		const params: { [propName: string]: ModelFormDataType } = {};
		Object.keys(formData).forEach((key: string) => {
			params[key] = formData[key];
		});

		try {
			const res = await AIFilterApi({
				image_url: originalSrc,
				service_name: props.serviceName,
				modelParams: params,
			});

			if (res.data.result) {
				setTaskSucceed(true);
				const result = res.data.result;

				if (props.serviceName === 'get_LUT') {
					setLutFileUrl(result);
					OverlayToaster.create({ position: Position.TOP }).show({
						message: <p>Operation Success!</p>,
						intent: Intent.SUCCESS,
					});
				} else {
					let src;
					if (isBase64(result) || process.env.NEXT_PUBLIC_ENV === 'production') {
						src = result;
					} else {
						src = result.replace(process.env.NEXT_PUBLIC_FE_HOST, process.env.NEXT_PUBLIC_BE_HOST);
					}
					props.serviceName !== 'denoise' && setProcessedSrc(src);
					handleCanvas(w, h, src, props.serviceName === 'denoise' ? params['strength'] as number : null);
				}
			} else {
				OverlayToaster.create({ position: Position.TOP }).show({
					message: <p>The server is busy, please try it later.</p>,
					intent: Intent.DANGER,
				});
				setTaskSucceed(false);
			}
		} catch (error) {
			OverlayToaster.create({ position: Position.TOP }).show({
				message: <p>An error occurred. Please try again.</p>,
				intent: Intent.DANGER,
			});
			setTaskSucceed(false);
		} finally {
			setIsDialogLoading(false);
			setShowRunBtn(false);
		}
	}
	function handleApplyBtn(): void {
		props.applyBtnHandler && props.applyBtnHandler();

		const axis = store.selectedElements[0];
		store.activePage.addElement({
			type: 'image',
			src: processedSrc,
			x: axis.x + 50,
			y: axis.y + 50,
			width: axis.width,
			height: axis.height,
		});

		clearDialog();
	}

	function handleCancelBtn(): void {
		props.cancelBtnHandler && props.cancelBtnHandler();
		console.log("cancel button clicked");
		clearDialog();
	}
	const [lutFileUrl, setLutFileUrl] = useState<string>('');
	const refs = useRef<{ [key: string]: any }>({});

	function handleDownloadBtn(): void {

		fetch(lutFileUrl).then((response) => {
			response.blob().then((blob) => {
            
				// Creating new object of PDF file
				const fileURL =
					window.URL.createObjectURL(blob);
                    
				// Setting various property values
				let alink = document.createElement("a");
				alink.href = fileURL;
				alink.download = 'lut_file' + Date.now() + '.cube';
				alink.click();
				clearDialog();
			});
		});
	}

	const [taskSucceed, setTaskSucceed] = useState<boolean>(undefined);

	const footerActions: JSX.Element = (
		<>
			{console.log("footer actions")}
			{props.serviceName === "get_LUT" ? (
				showRunBtn ? (
					<Button onClick={handleRunBtn} loading={isDialogLoading}>
						Run
					</Button>
				) : (
					taskSucceed && (
						<>
							<Button onClick={handleDownloadBtn}>
								Download
							</Button>
						</>
					)
				)
			) : (
				showRunBtn ? (
					<Button onClick={handleRunBtn} loading={isDialogLoading}>
						Run
					</Button>
				) : (
					taskSucceed && (
						<Button onClick={handleApplyBtn}>
							Apply
						</Button>
					)
				)
			)}
			<Button onClick={handleCancelBtn}>
				Cancel
			</Button>
		</>
	);


	function handleServiceAvl() {
		OverlayToaster.create({ position: Position.TOP })
			.show({
				message: <><p>You do not have permission to use this service.</p><p>Please contact admin.</p></>,
				intent: Intent.DANGER,
			});
	}

	const [oriImg, setOriImg] = useState<HTMLImageElement>(undefined);


	function handleCanvas(width: number, height: number, src: string, strength?: number) {
		console.log("handle Canvas");
		const canvas = document.getElementById('processedImg') as HTMLCanvasElement;
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');

		const img = new Image();
		img.src = src;
		img.crossOrigin = 'Anonymous';
		img.onload = function () {
			ctx.drawImage(img, 0, 0, width, height);
			if (props.serviceName === 'denoise') {
				const afterImg = ctx.getImageData(0, 0, width, height);

				const oriCanvas = document.getElementById('oriImg') as HTMLCanvasElement;
				oriCanvas.width = width;
				oriCanvas.height = height;
				const oriCtx = oriCanvas.getContext('2d');
				oriCtx.drawImage(oriImg, 0, 0, width, height);
				const beforeImg = oriCtx.getImageData(0, 0, width, height);

				for (let index = 0; index < afterImg.data.length; index++) {
					afterImg.data[index] = afterImg.data[index] * strength + beforeImg.data[index] * (1 - strength);
				}

				ctx.putImageData(afterImg, 0, 0);
				setProcessedSrc(canvas.toDataURL('image/jpg', 1));
			}
		};
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
											{formState[key]['ui:widget'] === 'numericInput' &&
												<MyNumericInput {...formState[key]}
													onChange={(val: number) => {
														formData[key] = val;
														console.log('numericInput', formData[key]);
													}}
												/>
											}
											{formState[key]['ui:widget'] === 'file' && key != "content_image" &&
												<MyFileInput {...formState[key]}
													ref={(el) => (refs.current[key] = el)}
													onFileSelect={(val: File) => {
														formData[key] = val;
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
				<DialogBody className={styles.dialogBody} useOverflowScrollContainer={false}>

					<div className={styles.canvasWrapper} ref={imageRef}
						style={{ width: canvasWH.width, height: canvasWH.height }}>
			

						{props.serviceName !== 'get_LUT' && (
							<>
								<canvas id="oriImg" className={styles.oriImg}></canvas>
								<canvas id="processedImg" className={styles.after}></canvas>

								{originalSrc && (
									<img src={originalSrc}
										className={!processedSrc ? styles.display : styles.before}
										style={!processedSrc ? {} : { width: `${sliderPos}%` }} />
								)}

								{processedSrc && (
									<div className={styles.slider}
										style={{ 'left': `${sliderPos}%` }}
										onMouseMove={watchMouseMove}></div>
								)}
							</>
						)}

					</div>

					{isDialogLoading && (
						<div className={styles.spinnerMask}>
							<Spinner className={styles.spinner} />
						</div>
					)}
				</DialogBody>

				{/* Conditionally render the footer actions */}
				<DialogFooter actions={props.serviceName === 'get_LUT' && !isDialogLoading
					? [
						{
							text: "Download",
							onClick: () => handleDownloadBtn(), // Handle the download logic here
						},
						{
							text: "Cancel",
							onClick: handleCancelBtn, // Close the dialog
						}
					]
					: footerActions}
					className={styles.dialogFooterMain}>
				</DialogFooter>
			</Dialog>

		</>
	)
},
);
export default CardContainer;