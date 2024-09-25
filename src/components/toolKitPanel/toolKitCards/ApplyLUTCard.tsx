import styles from './cardContainer.module.css';
import { useState, useRef, useEffect } from 'react';
import {
    Button, Dialog, DialogBody, DialogFooter, Divider, H5, Intent, OverlayToaster, Position, Spinner,
} from '@blueprintjs/core';
import { ArrowDown } from '@/components/icons';
import { CardContainerProps, CardContainerTheme } from '@/components/toolKitPanel/types.ts';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { getToken } from '@/store/userSlice.ts';
import { AIFilterApi} from '@/api';
import { exportBase64FromCanvas, readImage } from '@/common/utils/image.tsx';
import { int } from '@/common/utils/tools.ts';
import MySlider from '../../formComponents/slider';
import MyRadio from '@/components/formComponents/radio';
import MySelect from '@/components/formComponents/select';
import MyTextArea from '@/components/formComponents/textarea';
import MySwitch from '@/components/formComponents/switch';
import { ServiceModelOptions, ModelFormDataType } from '@/common/types/AIServices.ts';
import MyNumericInput from '@/components/formComponents/numericInput';
import MyFileInput from '@/components/formComponents/file';
import {handleFilter } from '@/common/utils/canvas.ts';
import { cancelAIFilterRequest } from '@/api/ai';
import { CanceledError } from 'axios';
import { applyMaskToImage } from '@/components/helpers/maskUtils';
import createStore from 'polotno/model/store';


export default function ApplyLUTCard(props: CardContainerProps): JSX.Element {
    const theme: CardContainerTheme = {
        header: { background: props.headerColor },
        body: { background: props.bodyColor },
    };
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const store = props.store;
    const dispatch = useAppDispatch();

    

    const [originalSrc, setOriginalSrc] = useState<string>('');
    const [processedSrc, setProcessedSrc] = useState<string>('');
    const [styleImage, setStyleImage] = useState<string>('');
    const [styleLUT, setStyleLUT] = useState<string>('');
    const [canvasWH, setCanvasWH] = useState({ width: '100%', height: '100%' });
    const [cancelled, setCancelled] = useState<boolean>(false);

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

    const [formData, setFormData] = useState<{ [propName: string]: ModelFormDataType }>({});
    const [formState, setFormState] = useState<ServiceModelOptions>({});
    const [paramOrder, setParamOrder] = useState<Array<string>>([]);
    useEffect(() => {
        const tmp: { [propName: string]: ModelFormDataType } = {};
        for (const key in props.model) {
            tmp[key] = props.model[key]['default'];
        }

        setFormData(tmp);
        setFormState(props.model);
        const order = 'ui:order' in props.settings ? props.settings['ui:order'] : Object.keys(props.model);
        setParamOrder(order);
    }, [props.model,props.settings]);
    const [partCardDialogProps, setPartCardDialogProps] = useState({
		serviceName: '',
		toolKitTitle: '',
		headerIcon: null,

		originalImageObj: null,
		formData: {},
		model: {},
	});
    
    async function measureCanvasWH(): Promise<Array<number>> {
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
			return [int(w), int(h)];
		}
	}

    
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

    useEffect(() => {
        const fetchImage = async () => {
            if (originalSrc) {
                try {
                    setIsDialogLoading(true);
                    const img = await readImage(originalSrc);
                    setOriImg(img);
                    await handleRunBtn();
                } catch (error) {
                  console.error("Error handling image:", error);
                        OverlayToaster.create({ position: Position.TOP })
                            .show({
                                message: <p>Failed to process the image. Please try again later.</p>,
                                intent: Intent.DANGER,
                            });
                        setTaskSucceed(false);
                    
                } finally {
                    setIsDialogLoading(false);
                    setShowRunBtn(false);
                }
            }
        };

        fetchImage();

    }, [originalSrc]);

    useEffect(() => {
    if (processedSrc) {
        const loadProcessedImage = async () => {
            try {
                const img = await readImage(processedSrc);
                setProcessedImageObj(img);
                console.log("Processed image object set:", img);
            } catch (error) {
                console.error("Error loading processed image:", error);
            }
        };
        loadProcessedImage();
    }
    }, [processedSrc]);

     const refs = useRef<{ [key: string]: any }>({});

    const clearFileInputs = () => {
    paramOrder.forEach((key) => {
      if (refs.current[key]) {
        refs.current[key].clearInput();
      }
    });
  };

    async function showDialog() {
        console.log("store.selectedElements:", store.selectedElements);
        const selectedElement = store.selectedElements[0];
        if (selectedElement === null) {
            OverlayToaster.create({ position: Position.TOP })
                .show({
                    message: <p>Select an image</p>,
                    intent: Intent.DANGER,
                });
            return;
        }
        if (formData['style_image'] && formData['style_lut']) {
            OverlayToaster.create({ position: Position.TOP })
                .show({
                    message: <p>Please upload either <strong>style_image</strong> or <strong>style_lut</strong>, but not both.</p>,
                    intent: Intent.DANGER,
                });
            clearFileInputs();

            // Reset the formData
            formData['style_image'] = undefined;
            formData['style_lut'] = undefined;

            return;
        }
        if (!formData['style_image'] && !formData['style_lut']) {
            OverlayToaster.create({ position: Position.TOP })
                .show({
                    message: <p>Upload at least one: <strong>style image</strong> or <strong>style LUT</strong>.</p>,
                    intent: Intent.DANGER,
                });
            clearFileInputs();

            // Reset the formData
            formData['style_image'] = undefined;
            formData['style_lut'] = undefined;
            return;
        }
        setIsDialogOpen(true);
        setCancelled(false);
        if (formData['style_image']) {
            const base64StyleImage = await convertFileToBase64(formData['style_image']);
            setStyleImage(base64StyleImage);
            console.log("style_image:", formData['style_image']);
        }
        if (formData['style_lut']) {
            const base64StyleLUT = await convertFileToBase64(formData['style_lut']);
            setStyleLUT(base64StyleLUT);
            console.log("style_lut:", formData['style_lut']);
        }
        const src = selectedElement.attrs.image;
        setOriginalSrc(src);
        formData['content_image'] = src;
        
        
    }
    
    // const selector = useAppSelector;
    // const selectedElement = useAppSelector(getSelectedElement);

	// const token: string = selector(getToken);
	const [showRunBtn, setShowRunBtn] = useState<boolean>(true);
    
    async function handleRunBtn(): Promise<void> {
        props.runBtnHandler && props.runBtnHandler();
        setIsDialogLoading(true);
        const [w, h] = await measureCanvasWH();

        const params: { [propName: string]: ModelFormDataType } = {};
        Object.keys(formData).forEach((key: string) => {
        	params[key] = formData[key];
        });
        console.log(params);
        try {
            const res = await AIFilterApi({
                image_url: originalSrc,
                service_name: props.serviceName,
                modelParams: params,
            });

            if (!cancelled && res.data.result) {
                setTaskSucceed(true);
                const result = res.data.result;
                console.log("result:",result);
                setProcessedSrc(result);
                console.log("processedSrc", result);
;                 OverlayToaster.create({ position: Position.TOP })
                    .show({
                        message: <p>Operation Success!</p>,
                        intent: Intent.SUCCESS,
                    });
            }
        } catch (err) {
            console.log(err)
            if (err.name === "CanceledError") {
                OverlayToaster.create({ position: Position.TOP })
                    .show({
                        message: <p>Operation Cancelled!</p>,
                        intent: Intent.DANGER,
                    });
            }
            else {
                OverlayToaster.create({ position: Position.TOP })
                    .show({
                        message: <p>The server is busy, please try it later.</p>,
                        intent: Intent.DANGER,
                    });
                
            }
            setTaskSucceed(false);
        } finally {
            setIsDialogLoading(false);
            setShowRunBtn(false);
           
        }
    }
    const [oriImg, setOriImg] = useState<HTMLImageElement>(undefined);
    const [processedImageObj, setProcessedImageObj] = useState<HTMLImageElement>(undefined);


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

    
	function handleServiceAvl() {
		OverlayToaster.create({ position: Position.TOP })
			.show({
				message: <><p>You do not have permission to use this service.</p><p>Please contact admin.</p></>,
				intent: Intent.DANGER,
			});
    }
    
    function createImageElement(url: string, isCrossOrigin: boolean): HTMLImageElement {
		const img = new Image();
		if (isCrossOrigin) {
			img.crossOrigin = 'anonymous'; // Set the cross-origin attribute
		}
		img.src = url;
		return img;
	}

    function handleApplyBtn(): void {
		props.applyBtnHandler && props.applyBtnHandler();

        const axis = store.selectedElements[0];
        console.log("apply processedSrc:", processedImageObj.src);
        const x = axis.attrs.x;
        const y = axis.attrs.y;
        console.log("store pages:", store.pages);
        console.log("polotno store active page", store.activePage);
        // selectedElement.set({ src: processedImageObj.src });
        console.log("store selectedElement:", store.selectedElements);


        // dispatch(applyMaskToImage(oriImg, processedImageObj));
        // props.addElement(processedImageObj.src, axis);
		// page.addElement({
		// 	type: 'image',
		// 	src: processedImageObj.src,
		// 	x: x+ 50,
		// 	y: y + 50,
		// 	width: parseFloat(canvasWH.width),
		// 	height: parseFloat(canvasWH.height),
        // });
        
        handleCancelBtn();
	}

    function handleCancelBtn(): void {
        props.cancelBtnHandler && props.cancelBtnHandler();
        clearDialog();
        setCancelled(true);
        cancelAIFilterRequest();
        
    }

    function clearDialog(): void {
        setIsDialogOpen(false);
        setProcessedSrc('');
        setIsDialogLoading(false);
        setOriginalSrc('');
        setShowRunBtn(true);
        clearFileInputs();

        // Reset the formData
        formData['style_image'] = undefined;
        formData['style_lut'] = undefined;

    }

    const [taskSucceed, setTaskSucceed] = useState<boolean>(undefined);


    const footerActions: JSX.Element = (
		<>
			{showRunBtn ?
			 <Button onClick={handleRunBtn} loading={isDialogLoading}>Run</Button> : (taskSucceed &&
					<Button onClick={handleApplyBtn}>Apply</Button>)
			}
			<Button onClick={handleCancelBtn}>Cancel</Button>
		</>
    );
    

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
                        <p>Please upload either <strong>style LUT</strong> or <strong>style image</strong>, but not both.</p>
                        <br></br>
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

						{<>
							<canvas id="oriImg" className={styles.oriImg}></canvas>
							<canvas id="processedImg" className={styles.after}></canvas>

							{originalSrc && <img src={originalSrc}
												 className={!processedSrc ? styles.display : styles.before}
												 style={!processedSrc ? {} : { width: `${sliderPos}%` }} />
							}

						 {processedSrc && <img 
                                src={processedSrc}
                                className={styles.after}
                                style={{ left: `${sliderPos}%`}}
                                />}

                                {processedSrc && <div 
                                className={styles.slider}
                                style={{ left: `${sliderPos}%` }}
                                onMouseMove={watchMouseMove}
                            />}
                                                        </>}

					</div>
                    {isDialogLoading &&
                        <div className={styles.spinnerMask}>
                            <Spinner className={styles.spinner} />
                        </div>
                    }
                </DialogBody>
                <DialogFooter actions={footerActions} className={styles.dialogFooterMain}></DialogFooter>
            </Dialog>
        </>
    );
}


