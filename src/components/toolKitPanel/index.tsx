import styles from './toolKitPanel.module.css';
import { useEffect, useRef, useState } from 'react';
import { Intent, OverlayToaster, Position, Tab, TabId, Tabs } from '@blueprintjs/core';
import { BackgroundRemoverIcon, ColorizationIcon, DeBlurIcon, DeNoiseIcon, FaMagicIcon, LowLightIcon, MyImageFiltersIcon, SRIcon, ToolKitCardDefaultIcon, GetLUTIcon, ApplyLUTIcon } from '@/components/icons';
import CardContainer from '@/components/toolKitPanel/toolKitCards/cardContainer';
import SegmentCard from '@/components/toolKitPanel/toolKitCards/SegCard';
import Container from './toolKitCards/container.tsx';
import ToolKitDialog from './toolKitDialog';
import SuperResolution from '@/components/toolKitPanel/toolKitCards/SuperResolution';
import Denoise from '@/components/toolKitPanel/toolKitCards/Denoise';
import Deblur from '@/components/toolKitPanel/toolKitCards/Deblur';
import LowLight from '@/components/toolKitPanel/toolKitCards/LowLight';
import Colorization from '@/components/toolKitPanel/toolKitCards/Colorization';
import { ModelFormDataType, AIServiceOptions } from '@/common/types/AIServices';
import { Card2DialogOptions, CardContainerProps } from '@/components/toolKitPanel/types.ts';
import { getMIMETypeFromBase64, isValidImageMIMEType, readImage } from '@/common/utils/image.tsx';
import { isBase64 } from '@/common/utils/tools.ts';
import { blendImageByRatio, handleFilter } from '@/common/utils/canvas.ts';
import { AxiosResponse } from 'axios';
import { AIFilterApi } from '@/api';
import { AIFilterResponse } from '@/api/ai.ts';
import { StoreType } from 'polotno/model/store';
import MyImageFiltersPanel from '@/components/toolKitPanel/effectsTab';
import GetLUTCard from './toolKitCards/GetLUTCard.tsx';
import ApplyLUTCard from './toolKitCards/ApplyLUTCard.tsx';
import GetLUT from './toolKitCards/GetLUT/index.tsx';
import ApplyLUT from './toolKitCards/ApplyLUT/index.tsx';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';



const graduatedColors: Array<string> = ['#cda3cd', '#ba8db9', '#a678a6', '#936293', '#814e80', '#6e396e','#652f65', '#5c255c'];
const iconMap: { [propName: string]: JSX.Element } = {
	face_bg: SRIcon,
	denoise: DeNoiseIcon,
	deblur: DeBlurIcon,
	low_light: LowLightIcon,
	background_remover: BackgroundRemoverIcon,
	colorization: ColorizationIcon,
	get_LUT: GetLUTIcon,
	apply_LUT: ApplyLUTIcon,
	segment_anything: BackgroundRemoverIcon,
};

export default function ToolKitPanel(props: {
	store: StoreType,
	konvaStage: Konva.Stage,
	toolKitAIServices: Array<AIServiceOptions>
}): JSX.Element {
	/** init <ToolKitPanel /> **/
	const [services, setServices] = useState<Array<CardContainerProps>>([]);
	const [inactivatedServices, setInactivatedServices] = useState<Array<CardContainerProps>>([]);

	useEffect((): void => {
		const tmpServices: Array<CardContainerProps> = [];
		const tmpInactivatedServices: Array<CardContainerProps> = [];
		let colorIdx: number = 0;

		props.toolKitAIServices.forEach((service: AIServiceOptions): void => {
			const cardProps: CardContainerProps = {
				toolKitTitle: service.displayName,
				headerIcon: iconMap[service.serviceName] || ToolKitCardDefaultIcon,
				serviceName: service.serviceName,
				serviceAvl: service.serviceAvl,
				model: service.model,
				settings: service.settings,
				headerColor: service.serviceAvl
							 ? graduatedColors[colorIdx++]
							 : 'rgba(151,158,171,0.91)',
				bodyColor: 'rgba(101,96,100,0.5)',
				store: props.store,
			};

			service.serviceAvl ? tmpServices.push(cardProps) : tmpInactivatedServices.push(cardProps);
		});

		setServices(tmpServices);
		setInactivatedServices(tmpInactivatedServices);
	}, [props.toolKitAIServices]);

	/** <CardDialog /> **/
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [processedImageObj, setProcessedImageObj] = useState<HTMLImageElement>(null);
	const [mixedImageObj, setMixedImageObj] = useState<HTMLImageElement>(null);
	// for apply_lut
	const [styleImage, setStyleImage] = useState<string>('');
	const [styleLUT, setStyleLUT] = useState<string>('');
	
	const [partCardDialogProps, setPartCardDialogProps] = useState({
		serviceName: '',
		toolKitTitle: '',
		headerIcon: null,

		originalImageObj: null,
		formData: {},
		model: {},
	});
	const [canModifyResultAfterApi, setCanModifyResultAfterApi] = useState<boolean>(false);

	 const childRef = useRef<{ clearFileInputs: () => void }>(null); 

	const handleClearInputs = (data: Card2DialogOptions) => {
		data.formData['style_image'] = undefined;
		data.formData['style_lut'] = undefined;
		if (childRef.current) {
			childRef.current.clearFileInputs(); // Call the child's function
			

		}
	};

	async function openDialog(data: Card2DialogOptions): Promise<void> {
    console.log("service name:", data.serviceName);

    const selectedElement = props.store.selectedElements[0];
    if (!selectedElement) {
        showOverlayMessage("Please select an image", Intent.DANGER);
        return;
    }

    const { serviceName, formData } = data;

    if (serviceName === 'apply_LUT') {
        const hasBothStyleInputs = formData['style_image'] && formData['style_lut'];
        const hasNoStyleInputs = !formData['style_image'] && !formData['style_lut'];

		if (hasBothStyleInputs) {
			console.log("3 formData[style_image]", formData['style_image']);
			console.log("3 formData[style_lut]", formData['style_lut']);
            showOverlayMessage("Please upload either style image or style LUT, but not both.", Intent.DANGER);
			handleClearInputs(data);
            return;
        }

        if (hasNoStyleInputs) {
            showOverlayMessage("Upload at least one: style image or style LUT.", Intent.DANGER);
            return;
		}
		if (formData['style_image']!=undefined) {
			console.log("1 formData[style_image]", formData['style_image']);
			console.log("1 formData[style_lut]", formData['style_lut']);
            const base64StyleImage = await convertFileToBase64(data, formData['style_image'], "image");
            setStyleImage(base64StyleImage);
            console.log("style_image:", formData['style_image']);
        }

		if (formData['style_lut']) {
			console.log("2 formData[style_image]", formData['style_image']);
			console.log("2 formData[style_lut]", formData['style_lut']);
            const base64StyleLUT = await convertFileToBase64(data, formData['style_lut'], "cube");
            setStyleLUT(base64StyleLUT);
            console.log("style_lut:", formData['style_lut']);
        }

        formData['content_image'] = await handleFilter(selectedElement, false);

        
    }
	 setIsDialogOpen(true);
    if ('canModifyResultAfterApi' in data) {
        setCanModifyResultAfterApi(data.canModifyResultAfterApi);
    }

    const src: string = await handleFilter(selectedElement, false);
    const img: HTMLImageElement = await readImage(src);

    const service = services.find(s => s.serviceName === serviceName);
    if (service) {
        setPartCardDialogProps({
            serviceName,
            toolKitTitle: service.toolKitTitle,
            headerIcon: service.headerIcon,
            originalImageObj: img,
            formData,
            model: service.model,
        });
    }

		setDialogOptions(data);
    await callAIModel(src, serviceName, formData,data);
}

function showOverlayMessage(message: string, intent: Intent) {
    OverlayToaster.create({ position: Position.TOP }).show({
        message: <p>{message}</p>,
        intent: intent,
    });
}
	
	const [lutFileUrl, setLutFileUrl] = useState<string>('');

	async function callAIModel(
    src: string, 
    serviceName: string, 
		formData: { [propName: string]: ModelFormDataType },
	data: Card2DialogOptions
): Promise<void> {
		try {
			if (serviceName === 'apply_LUT') {
				formData['content_image'] = src;
			}

			// Await the API response
			const res: AxiosResponse<AIFilterResponse, any> = await AIFilterApi({
				image_url: src,
				service_name: serviceName,
				modelParams: formData
			});

			if (res.data.result) {
				const result: string = res.data.result;

				if (serviceName === 'get_LUT') {
					setLutFileUrl(result);
					OverlayToaster.create({ position: Position.TOP }).show({
						message: <p>Operation Success!</p>,
						intent: Intent.SUCCESS,
					});

					const img: HTMLImageElement = await readImage(src);
					setMixedImageObj(img);
					setProcessedImageObj(img);
				} else {
					let processedSrc;
                
					if (isBase64(result) || process.env.NEXT_PUBLIC_ENV === 'production') {
						processedSrc = result;
					} else {
						processedSrc = result.replace(process.env.NEXT_PUBLIC_FE_HOST, process.env.NEXT_PUBLIC_BE_HOST);
					}

					const img: HTMLImageElement = await readImage(processedSrc);
					setProcessedImageObj(img);

					let mixImageBase64, baseImageObj;
					switch (serviceName) {
						case 'denoise':
						case 'deblur':
							baseImageObj = await readImage(src);
							mixImageBase64 = blendImageByRatio(baseImageObj, img, formData['strength'] as number);
							const mixedImage = await readImage(mixImageBase64);
							setMixedImageObj(mixedImage);
							break;
						default:
							setMixedImageObj(img);
					}
				}
			} else {
				throw new Error("No result from server.");
			}
		} catch (error) {
			if (error.name === "CanceledError") {
				OverlayToaster.create({ position: Position.TOP })
					.show({
						message: <p>Operation Cancelled!</p>,
						intent: Intent.DANGER,
					});
				handleClearInputs(data);
			}
			else {
				// Handle errors such as failed API calls or image processing issues
				console.error("Error in callAIModel:", error);
				OverlayToaster.create({ position: Position.TOP }).show({
					message: <p>The server is busy, please try again later.</p>,
					intent: Intent.DANGER,
				});
				handleClearInputs(data);
				
			}
		}
}



	function convertFileToBase64(data: Card2DialogOptions,file: File, type: String): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
		reader.onloadend = () => {
            if (file.name.endsWith('.cube') && type==="cube") {
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

                data.formData['style_lut'] = `data:@file/octet-stream;base64,${base64}`;
                console.log("style lut base64:", data.formData['style_lut']);
            } else {
                resolve(reader.result as string);
                console.log('Image file detected. Data URL:', reader.result);
                data.formData['style_image'] = reader.result as string;
            }
        };

		reader.onerror = (error) => reject(error);
			if (type === "image" && file.type &&  file.type.startsWith('image/')) {
				reader.readAsDataURL(file);
			} else if (type === "cube" && file.name && file.name.endsWith('.cube')) {
				reader.readAsText(file);
			}
			else {
				showOverlayMessage("Unsupported file type.", Intent.DANGER);
				
				handleClearInputs(data);
				return;
				
        }
    });
}


	function handleApplyBtn(img: HTMLImageElement): void {
		const axis = props.store.selectedElements[0];
		// props.store.activePage.addElement({
		// 	type: 'image',
		// 	src: img.src,
		// 	x: axis.x + 50,
		// 	y: axis.y + 50,
		// 	width: axis.width,
		// 	height: axis.height,
		// });
		axis.set({
			src: img.src,
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
            });
        });
	}

	function handleCardDialogClose(data: Card2DialogOptions): void {
		setIsDialogOpen(false);
		setPartCardDialogProps({
			serviceName: '',
			toolKitTitle: '',
			headerIcon: null,

			originalImageObj: null,
			formData: {},
			model: {},
		});
		setProcessedImageObj(null);
		setMixedImageObj(null);
		handleClearInputs(data);
		console.log("close dialog");
	}

	// function preprocess
	async function handleFormDataChange(args: { [propName: string]: ModelFormDataType }): Promise<void> {
		let mixImageBase64;
		switch (partCardDialogProps.serviceName) {
			case 'denoise':
				console.log('denoise');
				mixImageBase64 = blendImageByRatio(partCardDialogProps.originalImageObj, processedImageObj, args['strength'] as number);
				await readImage(mixImageBase64).then(img => setMixedImageObj(img));
				break;
			case 'deblur':
				console.log('deblur');
				mixImageBase64 = blendImageByRatio(partCardDialogProps.originalImageObj, processedImageObj, args['strength'] as number);
				await readImage(mixImageBase64).then(img => setMixedImageObj(img));
				break;
			default:
				console.log('no action');
		}
	}
	const [dialogOptions, setDialogOptions] = useState<Card2DialogOptions | null>(null);

	const [selectedTabId, setSelectedTabId] = useState<TabId>('ai');

	function handleTabClick(id: TabId): void {
		if (props.store.selectedElements.length !== 1) {
			OverlayToaster.create({ position: Position.TOP })
				.show({
					message: <p>select an image</p>, intent: Intent.DANGER,
				});
		} else {
			setSelectedTabId(id);
		}
	}

	// useEffect(() => {
	// 	props.store.on('change', () => {
	// 		console.log('in Effect');
	// 	});
	// }, []);
	//
	// props.store.on('change', () => {
	// 	console.log('out Effect');
	// });

	return (
		<div className={styles.wrapper}>
			<Tabs className={styles.tabs} onChange={handleTabClick} selectedTabId={selectedTabId}
				  renderActiveTabPanelOnly={true}>
				<Tab id="ai" title="AI Services" icon={FaMagicIcon} panel={
					<>
						{/*{services.map(data => data.serviceName === 'segment_anything'*/}
						{/*					  ? <SegmentCard {...data} key={data.serviceName} />*/}
						{/*					  : <CardContainer {...data} key={data.serviceName} />)}*/}

						{services.map(card => {
							switch (card.serviceName) {
								case 'face_bg':
									return <SuperResolution  {...card} key={card.serviceName}
															 openDialog={openDialog} />;
								case 'low_light':
									return <LowLight {...card} key={card.serviceName} openDialog={openDialog} />;
								case 'deblur':
									return <Deblur  {...card} key={card.serviceName} openDialog={openDialog} />;
								case 'denoise':
									return <Denoise  {...card} key={card.serviceName} openDialog={openDialog} />;
								case 'colorization':
									return <Colorization  {...card} key={card.serviceName} openDialog={openDialog} />;
								case 'get_LUT':
									return <GetLUT  {...card} key={card.serviceName} openDialog={openDialog} />;
								case 'apply_LUT':
									return <ApplyLUT  {...card} key={card.serviceName} openDialog={openDialog} ref={childRef} />;
							}
						})}

						{inactivatedServices.map(data => <Container {...data} key={data.serviceName} />)}
					</>
				} />
				<Tab id="effects" title="Effects" panel={<MyImageFiltersPanel store={props.store} konvaStage={props.konvaStage} />}
					 icon={MyImageFiltersIcon} />
			</Tabs>


			<ToolKitDialog
				{...partCardDialogProps}
				isDialogOpen={isDialogOpen}
				closeDialog={handleCardDialogClose}
				handleApplyBtn={handleApplyBtn}
				dialogOptions={dialogOptions}
				canModifyResultAfterApi={canModifyResultAfterApi}
				handleFormDataChange={handleFormDataChange}
				mixedImageObj={mixedImageObj}
				handleDownloadBtn= {handleDownloadBtn}
			/>
		</div>
	);
}