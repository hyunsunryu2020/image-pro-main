import styles from './cardContainer.module.css';
import { useState, useRef, useEffect } from 'react';
import {
    Button, Dialog, DialogBody, DialogFooter, Divider, Intent, OverlayToaster, Position, Spinner,
} from '@blueprintjs/core';
import { ArrowDown } from '@/components/icons';
import { CardContainerProps, CardContainerTheme } from '@/components/toolKitPanel/types.ts';
import { useAppSelector } from '@/store/hooks.ts';
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
import {handleFilter } from '@/common/utils/canvas.ts';
import { cancelAIFilterRequest } from '@/api/ai';
import { CanceledError } from 'axios';


export default function GetLUTCard(props: CardContainerProps): JSX.Element {
    const theme: CardContainerTheme = {
        header: { background: props.headerColor },
        body: { background: props.bodyColor },
    };
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const store = props.store;

    const [originalSrc, setOriginalSrc] = useState<string>('');
    const [processedSrc, setProcessedSrc] = useState<string>('');
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
        setParamOrder('ui:order' in props.settings ? props.settings['ui:order'] : Object.keys(props.model));
    }, []);

    
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

    const [lutFileUrl, setLutFileUrl] = useState<string>('');
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

    async function showDialog() {
        // console.log(selectedElement);
        const selectedElement=store.selectElements[0]
        if (selectedElement === undefined) {
            OverlayToaster.create({ position: Position.TOP })
                .show({
                    message: <p>Select an image</p>,
                    intent: Intent.DANGER,
                });
            return;
        }

        setIsDialogOpen(true);
        setCancelled(false);
        console.log(selectedElement);
        // const src = selectedElement.attrs.image;
        // setOriginalSrc(src); // This will trigger the useEffect when updated
        // console.log("src", src);
    }
    
    // const selector = useAppSelector;
    // const selectedElement = useAppSelector(getSelectedElement);

	// const token: string = selector(getToken);
	const [showRunBtn, setShowRunBtn] = useState<boolean>(true);

    async function handleRunBtn(): Promise<void> {
        props.runBtnHandler && props.runBtnHandler();
        setIsDialogLoading(true);
        const [w, h] = await measureCanvasWH();

        // const params: { [propName: string]: ModelFormDataType } = {};
        const params: { [propName: string]: ModelFormDataType } = {};
        Object.keys(formData).forEach((key: string) => {
        	params[key] = formData[key];
        });
		
        // params["base64"] = originalSrc;
        // params["image"] = originalSrc;
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
                // console.log(result);
                setLutFileUrl(result);
                 OverlayToaster.create({ position: Position.TOP })
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
            // This block executes regardless of success or failure
            setIsDialogLoading(false);
            setShowRunBtn(false);
        }
    }
    const [oriImg, setOriImg] = useState<HTMLImageElement>(undefined);


	function handleServiceAvl() {
		OverlayToaster.create({ position: Position.TOP })
			.show({
				message: <><p>You do not have permission to use this service.</p><p>Please contact admin.</p></>,
				intent: Intent.DANGER,
			});
	}

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

    function handleCancelBtn(): void {
        props.cancelBtnHandler && props.cancelBtnHandler();
        clearDialog();
        setCancelled(true);
        setTaskSucceed(false);
        cancelAIFilterRequest();
    }

    function clearDialog(): void {
        setIsDialogOpen(false);
        setLutFileUrl('');
        setIsDialogLoading(false);
        setOriginalSrc('');
        setOriImg(null);
        setShowRunBtn(true);

    }

    const [taskSucceed, setTaskSucceed] = useState<boolean>(undefined);


    const footerActions: JSX.Element = (
    <>
        {showRunBtn ? (
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
        )}
        <Button onClick={handleCancelBtn}>
            Cancel
        </Button>
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
                        {paramOrder.length > 1 &&
                            <>
                                {paramOrder.map((key, idx) => {
                                    return (
                                        <div key={idx}>
                                            {formState[key]['ui:widget'] === 'range' &&
                                                <MySlider {...formState[key]}
                                                          onChange={(val: any) => {
                                                              formData[key] = val;
                                                          }}
                                                />
                                            }
                                            {formState[key]['ui:widget'] === 'radio' &&
                                                <MyRadio {...formState[key]}
                                                         onChange={(val: any) => {
                                                             formData[key] = val;
                                                         }}
                                                />
                                            }
                                            {formState[key]['ui:widget'] === 'select' &&
                                                <MySelect {...formState[key]}
                                                          onChange={(val: any) => {
                                                              formData[key] = val;
                                                          }}
                                                />
                                            }
                                            {formState[key]['ui:widget'] === 'textarea' &&
                                                <MyTextArea {...formState[key]}
                                                            onChange={(val: any) => {
                                                                formData[key] = val;
                                                            }}
                                                />
                                            }
                                            {formState[key]['ui:widget'] === 'switch' &&
                                                <MySwitch {...formState[key]}
                                                          onChange={(val: any) => {
                                                              formData[key] = val;
                                                          }}
                                                />
                                            }
                                            {formState[key]['ui:widget'] === 'numericInput' &&
                                                <MyNumericInput {...formState[key]}
                                                                onChange={(val: number) => {
                                                                    formData[key] = val;
                                                                }}
                                                />
                                            }
                                        </div>);
                                })}
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

							{processedSrc && <div className={styles.slider}
												  style={{ 'left': `${sliderPos}%` }}
												  onMouseMove={watchMouseMove}></div>
							}
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
