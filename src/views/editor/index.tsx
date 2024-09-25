import styles from './editor.module.css';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { PolotnoContainer, SidePanelWrap } from 'polotno';
import { createStore } from 'polotno/model/store';
import Header from '@/components/header';
import { AIServiceAPI, ServiceModelOptions, AIServiceOptions } from '@/common/types/AIServices';
import { AIServicesListApi } from '@/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getTools, setAIServices } from '@/store/userSlice';
import { AxiosResponse } from 'axios';
import Konva from 'konva';


export default function EditorWrapper(): JSX.Element {
	/** Canvas state management **/
	const store = createStore({
		key: 'k2i_MVk-ITTiz3vU_T0r',
		showCredit: false,
	});
	store.addPage();

	/** AI services init **/
	const dispatch = useAppDispatch();
	const selector = useAppSelector;
	const userTools: Array<string> = selector(getTools);
	const [konvaStage, setKonvaStage] = useState<Konva.Stage | null>(null);

	
	const [toolKitServices, setToolKitServices] = useState<Array<AIServiceOptions>>([]);
	const onStageReady = (stage: Konva.Stage | null) => {
		console.log("Konva stage ready:", stage);
		setKonvaStage(stage);
	};
	
	useEffect((): void => {
		const fetchData = async (): Promise<void> => {
			await AIServicesListApi().then((res: AxiosResponse<Array<AIServiceAPI>, any>): void => {
				/*
				* 1. classify panelService & toolKitService
				* 2. merge JSONSchema & UISchema
				* */
				const tmpPanel: Array<AIServiceOptions> = [];
				const tmpToolKit: Array<AIServiceOptions> = [];

				res.data.forEach((service: AIServiceAPI): void => {
					const mergeSchema = (jsonSchema: string, uiSchema: string): {
						model: ServiceModelOptions;
						settings: {
							[propName: string]: any
						}
					} => {
						const jsonObj = jsonSchema && JSON.parse(jsonSchema);
						const uiObj = uiSchema && JSON.parse(uiSchema);
						const model: ServiceModelOptions = {};
						const settings: { [propName: string]: any } = {};
						const properties: Array<string> = Object.keys(jsonObj.properties);
						const required = jsonObj.required || [];

						for (const key of properties) {
							// merge jsonSchema & uiSchema of each model param
							const tmpObj = Object.assign({}, jsonObj.properties[key], uiObj[key]);
							if (required.includes(key)) {
								tmpObj[required] = true;
							}
							model[key] = tmpObj;
						}

						// set the rest settings in uiSchema
						for (const key in uiObj) {
							if (!properties.includes(key)) {
								settings[key] = uiObj[key];
							}
						}

						return { model, settings };
					};

					const schema = mergeSchema(service.jsonSchema, service.uiSchema);

					const AIServiceProps: AIServiceOptions = {
						displayName: service.displayName,
						serviceName: service.serviceName,
						serviceAvl: service.serviceOn && userTools.includes(service.serviceName),
						model: schema.model,
						settings: schema.settings,
					};

					if (service.content === 'panel') {
						tmpPanel.push(AIServiceProps);
					} else if (service.content === 'toolkit') {
						tmpToolKit.push(AIServiceProps);
					}
				});

				dispatch(setAIServices({ panel: tmpPanel, toolkit: tmpToolKit }));
				setToolKitServices(tmpToolKit);
			});
		};

		fetchData().catch(console.error);
	}, [userTools]);

	/** lazy load components **/
	const MySidePanel = dynamic(() => import('@/components/sidePanel'));
	const ToolKitPanel = dynamic(() => import('@/components/toolKitPanel'));

	
	// dynamically import Workspace to ensure perfect window size
	const DynamicMyWorkspace = dynamic(() => import('@/components/workspace'));


	
	return (
		<div>
			<Header store={store} />
			<div className={styles.wrapper}>
				<PolotnoContainer  className="polotno-app-container" style={{ width: '100%', height: '100%' }}>
					<SidePanelWrap>
						<MySidePanel store={store} />
					</SidePanelWrap>
						<DynamicMyWorkspace store={store} onStageReady={onStageReady} />
				</PolotnoContainer>
						<ToolKitPanel store={store} toolKitAIServices={toolKitServices} konvaStage={konvaStage} />

			</div>
		</div>
	);
}