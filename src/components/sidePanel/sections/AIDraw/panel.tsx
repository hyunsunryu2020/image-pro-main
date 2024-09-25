import { useEffect, useState } from 'react';
import { getImageSize } from 'polotno/utils/image';
import { StoreType } from 'polotno/model/store';
import { Button, Spinner, Portal, OverlayToaster, Position, Intent, Colors } from '@blueprintjs/core';
import styles from './aiDraw.module.css';
import { ServiceModelOptions, ModelFormDataType, AIServiceOptions } from '@/common/types/AIServices.ts';
import { AdvancedIcon, AIDrawTitleIcon, PromptIcon, SeedIcon, StepsIcon, WeightIcon } from '@/components/icons';
import AIDrawOptionContainer from '@/components/sidePanel/sections/AIDraw/AIDrawOptionContainer.tsx';
import MySlider from '@/components/formComponents/slider';
import MyNumericInput from '@/components/formComponents/numericInput';
import { AIFilterApi } from '@/api';
import { useAppSelector } from '@/store/hooks.ts';
import { getPanelAIServices } from '@/store/userSlice.ts';
import { AxiosResponse } from 'axios';
import { AIFilterResponse } from '@/api/ai.ts';
import PromptSection from '@/components/sidePanel/sections/AIDraw/promptSection.tsx';
import { readImage } from '@/common/utils/image.tsx';

// definition of each param
export interface AIDrawModelOptions {
	name: string;
	icon: JSX.Element;
	title: string;
	toolTip: string;
	cardInput: JSX.Element;
	isShow: boolean;
}

/** init Options Panel **/
const iconMap: { [propName: string]: JSX.Element } = {
	prompt: PromptIcon,
	guidance_scale: WeightIcon,
	step_count: StepsIcon,
	seed: SeedIcon,
	advanced: AdvancedIcon,
};

export default function AIDrawPanel(props: { store: StoreType }): JSX.Element {
	/** init <AIDrawPanel /> **/
	const selector = useAppSelector;
	const userPanelAIServices: Array<AIServiceOptions> = selector(getPanelAIServices);
	// stable diffusion model required params
	const [model, setModel] = useState<ServiceModelOptions>(undefined);
	// settings to render panel
	const [settings, setSettings] = useState<{ [propName: string]: any }>({});
	useEffect((): void => {
		console.log('SDXL_FreeU', userPanelAIServices);
		userPanelAIServices.length > 0 && userPanelAIServices.forEach((service: AIServiceOptions): void => {
			if (service.serviceName === 'SDXL_FreeU') {
				setModel(service.model);
				setSettings(service.settings);
			}
		});
	}, [userPanelAIServices]);

	/** render <AIDrawPanel /> **/
	const [panelModel, setPanelModel] = useState<Array<AIDrawModelOptions>>([]);
	// { param: value }
	const [formData, setFormData] = useState<{ [propName: string]: ModelFormDataType }>({});

	function setSessionStorage(formData: { [propName: string]: ModelFormDataType }): void {
		sessionStorage.setItem('AIDrawFormData', JSON.stringify(formData));
	}

	useEffect((): void => {
		if (model !== undefined) {
			const tmpPanelModel: Array<AIDrawModelOptions> = [];
			const tmpFormData: {
				[propName: string]: ModelFormDataType
			} = sessionStorage.getItem('AIDrawFormData') === null
				? {}
				: JSON.parse(sessionStorage.getItem('AIDrawFormData'));

			// const paramOrder = 'ui:order' in settings ? settings['ui:order'] : Object.keys(model);
			// console.log(model);

			Object.keys(model).forEach((param: string): void => {
				// merge sessionStorage and model default value
				if (!(param in tmpFormData)) {
					tmpFormData[param] = model[param].default || undefined;
				}
			});

			// prompt
			tmpPanelModel.push({
				name: 'prompt',
				icon: iconMap['prompt'],
				title: model['prompt'].title,
				toolTip: '',
				isShow: true,
				cardInput: <PromptSection  {
											   ...{
												   prompt: {
													   ...model['prompt'],
													   default: tmpFormData['prompt'],
												   },
												   negative_prompt: {
													   ...model['negative_prompt'],
													   default: tmpFormData['negative_prompt'],
												   },
											   }
										   }
										   onChange={(value: {
											   prompt: string,
											   negative_prompt: string
										   }): void => {
											   setFormData(prevState => {
												   const newState = {
													   ...prevState, ...value,
												   };
												   setSessionStorage(newState);
												   return newState;
											   });
										   }}
				/>,
			});
			// seed
			tmpPanelModel.push({
				name: 'seed',
				icon: iconMap['seed'],
				title: model['seed'].title,
				toolTip: model['seed'].toolTip,
				isShow: false,
				cardInput: <MyNumericInput {...model['seed']}
										   default={tmpFormData['seed']}
										   onChange={(value: number): void => {
											   setFormData(prevState => {
												   const newState = {
													   ...prevState,
													   ['seed']: value,
												   };
												   setSessionStorage(newState);
												   return newState;
											   });
										   }}
				/>,
			});
			// guidance_scale & step_count
			tmpPanelModel.push({
				name: 'guidance_scale',
				icon: iconMap['guidance_scale'],
				title: model['guidance_scale'].title,
				toolTip: model['guidance_scale'].toolTip,
				isShow: false,
				cardInput: <MySlider {...model['guidance_scale']}
									 default={tmpFormData['guidance_scale']}
									 onChange={(value: number): void => {
										 setFormData(prevState => {
											 const newState = {
												 ...prevState,
												 ['guidance_scale']: value,
											 };
											 setSessionStorage(newState);
											 return newState;
										 });
									 }}
				/>,
			});
			tmpPanelModel.push({
				name: 'step_count',
				icon: iconMap['step_count'],
				title: model['step_count'].title,
				toolTip: model['step_count'].toolTip,
				isShow: false,
				cardInput: <MySlider {...model['step_count']}
									 default={tmpFormData['step_count']}
									 onChange={(value: number): void => {
										 setFormData(prevState => {
											 const newState = {
												 ...prevState,
												 ['step_count']: value,
											 };
											 setSessionStorage(newState);
											 return newState;
										 });
									 }}
				/>,
			});
			// rest
			tmpPanelModel.push({
				name: 'rest',
				icon: iconMap['advanced'],
				title: 'Advanced',
				toolTip: '',
				isShow: false,
				cardInput: <>{
					['s1', 's2', 'b1', 'b2'].map(key =>
						<MySlider {...model[key]}
								  default={tmpFormData[key]}
								  key={key}
								  onChange={(value: number): void => {
									  setFormData(prevState => {
										  const newState = {
											  ...prevState,
											  [key]: value,
										  };
										  setSessionStorage(newState);
										  return newState;
									  });
								  }}
						/>)}
				</>,
			});
			// console.log(tmpFormData);
			setPanelModel(tmpPanelModel);
			setFormData(tmpFormData);
		}
	}, [model]);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function submit(): Promise<void> {
		setIsLoading(true);

		await AIFilterApi({
			service_name: 'SDXL_FreeU',
			modelParams: { ...formData },
		}).then(async (res: AxiosResponse<AIFilterResponse, any>): Promise<void> => {
			if (res.data.result) {
				const url = 'http://10.88.76.142:8000/' + res.data.result;
				// const { width, height } = await getImageSize(url);
				const image = await readImage(url);
				props.store.activePage.addElement({
					type: 'image',
					src: url,
					x: 50,
					y: 50,
					width: image.width,
					height: image.height,
				});
			} else {
				OverlayToaster.create({ position: Position.TOP })
					.show({
						message: <p>The server is busy, please try it later.</p>,
						intent: Intent.DANGER,
					});
			}

			setIsLoading(false);
		});
	}


	return (
		<div className={styles.panelWrapper}>
			<div className={styles.title}>
				{AIDrawTitleIcon}
				<p>Generation Options</p>
			</div>

			<div className={styles.optionsWrapper}>
				{panelModel.map((cardProp: AIDrawModelOptions) => <AIDrawOptionContainer {...cardProp}
																						 key={cardProp.title} />)}
				<Button text="Generate" fill onClick={submit} />
			</div>

			{isLoading && <Portal>
				<div className={styles.spinnerMask}>
					<Spinner className={styles.spinner} style={{ stroke: Colors.VIOLET1 }} />
				</div>
			</Portal>}
		</div>
	);
}