// /**
//  * This is a container for AI service.
//  * extract common and basic functions and states from the individual AI service
//  * as for some unique services, we can pass custom function to show unique operation
//  */
// import styles from './container.module.css';
// import { useEffect, useImperativeHandle, useRef, useState } from 'react';
// import { ModelFormDataType, ServiceModelOptions } from '@/common/types/AIServices.ts';
// import { Button, Divider, Intent, OverlayToaster, Position } from '@blueprintjs/core';
// import { ArrowDown } from '@/components/icons';
// import MySlider from '@/components/formComponents/slider';
// import MyRadio from '@/components/formComponents/radio';
// import MySelect from '@/components/formComponents/select';
// import MyTextArea from '@/components/formComponents/textarea';
// import MySwitch from '@/components/formComponents/switch';
// import MyNumericInput from '@/components/formComponents/numericInput';
// import { Card2DialogOptions, ToolKitCardContainerProps } from '../types.ts';
// import MyFileInput from '@/components/formComponents/file/index.tsx';
// import { Refresh } from '@blueprintjs/icons/lib/esm/generated/16px/paths/index';


// export default function Container(props: ToolKitCardContainerProps): JSX.Element {
// 	/**
// 	 * <CardContainer /> init
// 	 * @formData save this service's model params. When you run this service, <CardContainer /> passes formData to
// 	 *     <ToolKitPanel /> and then <ToolKitPanel /> passes it to <ToolKitDialog />. Finally, formData will be used to
// 	 *     call API(ai_filter).
// 	 * @paramsOrder <CardContainer /> will follow this order to render params if applicable.
// 	 */
// 	const [formData, setFormData] = useState<{ [propName: string]: ModelFormDataType }>({});
// 	const [paramsOrder, setParamsOrder] = useState<Array<string>>([]);

// 	useEffect(() => {
// 		const tmp: { [propName: string]: ModelFormDataType } = {};
// 		for (const key in props.model) {
// 			tmp[key] = props.model[key]['default'];
// 		}

// 		setFormData(tmp);
// 		setParamsOrder('ui:order' in props.settings ? props.settings['ui:order'] : Object.keys(props.model));
// 	}, []);

// 	function updateFormData(key: string, value: ModelFormDataType): void {
// 		setFormData(prevState => {
// 			return {
// 				...prevState,
// 				[key]: value,
// 			};
// 		});
// 	}
// 	const refs = useRef<{ [key: string]: any }>({});

// 	const clearFileInputs = () => {
//     paramsOrder.forEach((key) => {
//       if (refs.current[key]) {
//         refs.current[key].clearInput();
//       }
//     });
// 	};
// 	useImperativeHandle(ref, () => ({
// 		clearFileInputs,
// 	}))

// 	/**
// 	 * open & close <CardContainer />
// 	 */
// 	const [isOpen, setIsOpen] = useState<boolean>(false);

// 	function toggleToolKitCard(): void {
// 		setIsOpen(!isOpen);
// 	}

// 	// needn't render 'image' param in panel
// 	function hasNonImageKeys(model: ServiceModelOptions): boolean {
// 		if (model) {
// 			for (const key in model) {
// 				if (key !== 'image') {
// 					return true;
// 				}
// 			}
// 			return false;
// 		}
// 		return false;
// 	}

// 	function handleRunBtnClick(): void {
// 		const options: Card2DialogOptions = { serviceName: props.serviceName, formData: formData };
// 		if ('canModifyResultAfterApi' in props) {
// 			options['canModifyResultAfterApi'] = props.canModifyResultAfterApi;
// 		}
// 		props.openDialog(options);
// 	}

// 	function handleServiceAvl(): void {
// 		OverlayToaster.create({ position: Position.TOP })
// 			.show({
// 				message: <><p>You do not have permission to use this service.</p><p>Please contact admin.</p></>,
// 				intent: Intent.DANGER,
// 			});
// 	}


// 	return (
// 		<div className={styles.wrapper}>
// 			{ /*Header*/}
// 			<div className={styles.header} style={{ background: props.headerColor }}
// 				 onClick={toggleToolKitCard}>
// 				<div className={styles.headerIcon}>{props.headerIcon}</div>
// 				<div>{props.toolKitTitle}</div>
// 				<div className={isOpen ? styles.arrowUp : styles.arrowDown}>
// 					{ArrowDown}
// 				</div>
// 			</div>

// 			{ /*Body*/}
// 			{isOpen &&
// 				<div className={styles.body}>
// 					{props.serviceName === "apply_LUT" && (
// 	<>
// 		<p>
// 			Please upload either <strong>style LUT</strong> or <strong>style image</strong>, but not both.
// 		</p>
// 		<br />
// 	</>
// )}
// 					{ /*Panel*/}
// 					{hasNonImageKeys(props.model) &&
// 						<>
// 							{
// 								paramsOrder.map((paramName: string, index: number) => {
// 									if (paramName !== 'image' && paramName !== 'content_image') {
// 										const settings = props.model[paramName];
// 										switch (settings['ui:widget']) {
											
// 											case 'range':
// 												return (
// 													<div key={index}>
// 														<MySlider {...settings}
// 																  onChange={(value: number) => updateFormData(paramName, value)}
// 														/>
// 													</div>);
// 											case 'radio':
// 												return (
// 													<div key={index}>
// 														<MyRadio {...settings}
// 																 onChange={(value: number) => updateFormData(paramName, value)}
// 														/>
// 													</div>);
// 											case 'select':
// 												return (
// 													<div key={index}>
// 														<MySelect {...settings}
// 																  onChange={(value: number) => updateFormData(paramName, value)}
// 														/>
// 													</div>);
// 											case 'textarea':
// 												return (
// 													<div key={index}>
// 														<MyTextArea {...settings}
// 																	onChange={(value: number) => updateFormData(paramName, value)}
// 														/>
// 													</div>);
// 											case 'switch':
// 												return (
// 													<div key={index}>
// 														<MySwitch {...settings}
// 																  onChange={(value: number) => updateFormData(paramName, value)}
// 														/>
// 													</div>);
// 											case 'numericInput':
// 												return (
// 													<div key={index}>
// 														<MyNumericInput {...settings}
// 																		onChange={(value: number) => updateFormData(paramName, value)}
// 														/>
// 													</div>);
// 											case 'file':
// 												return (
// 													<div key={index}>
// 														<MyFileInput {...settings} ref={(el) => (refs.current[index] = el)}
// 																		onFileSelect={(value: File) => updateFormData(paramName, value)}
// 														/>
// 													</div>);
													



// 											default:
// 												// console.log("params~~~~~~~~");
// 												// console.log(settings['ui:widget']);
// 												return <p key={index}>{paramName}</p>;
// 										}
// 									}
// 								})
// 							}
// 							<Divider />
// 						</>
// 					}

// 					<Button className={styles.runBtn} onClick={handleRunBtnClick}>Run</Button>

// 					{ /*Mask*/}
// 					{!props.serviceAvl && <div className={styles.mask} onClick={handleServiceAvl}></div>}
// 				</div>
// 			}
// 		</div>);
// }
import styles from './container.module.css';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ModelFormDataType, ServiceModelOptions } from '@/common/types/AIServices.ts';
import { Button, Divider, Intent, OverlayToaster, Position } from '@blueprintjs/core';
import { ArrowDown } from '@/components/icons';
import MySlider from '@/components/formComponents/slider';
import MyRadio from '@/components/formComponents/radio';
import MySelect from '@/components/formComponents/select';
import MyTextArea from '@/components/formComponents/textarea';
import MySwitch from '@/components/formComponents/switch';
import MyNumericInput from '@/components/formComponents/numericInput';
import { Card2DialogOptions, ToolKitCardContainerProps } from '../types.ts';
import MyFileInput from '@/components/formComponents/file/index.tsx';
import { Refresh } from '@blueprintjs/icons/lib/esm/generated/16px/paths/index';

const Container = forwardRef((props: ToolKitCardContainerProps,ref): JSX.Element => {
	/**
	 * <CardContainer /> init
	 */
	const [formData, setFormData] = useState<{ [propName: string]: ModelFormDataType }>({});
	const [paramsOrder, setParamsOrder] = useState<Array<string>>([]);

	useEffect(() => {
		const tmp: { [propName: string]: ModelFormDataType } = {};
		for (const key in props.model) {
			tmp[key] = props.model[key]['default'];
		}

		setFormData(tmp);
		setParamsOrder('ui:order' in props.settings ? props.settings['ui:order'] : Object.keys(props.model));
	}, [props.model, props.settings]);

	function updateFormData(key: string, value: ModelFormDataType): void {
		setFormData(prevState => {
			return {
				...prevState,
				[key]: value,
			};
		});
	}

	const refs = useRef<{ [key: string]: any }>({});
	
	function clearFileInputs(){
		console.log("clearing file inputs from container");
		paramsOrder.forEach((key) => {
			if (refs.current[key]) {
				refs.current[key].value = undefined;
				refs.current[key].clearInput();
			}
		});
		return;
	};

	useImperativeHandle(ref, () => ({
		clearFileInputs,
	}));

	/**
	 * open & close <CardContainer />
	 */
	const [isOpen, setIsOpen] = useState<boolean>(false);

	function toggleToolKitCard(): void {
		setIsOpen(!isOpen);
	}

	// needn't render 'image' param in panel
	function hasNonImageKeys(model: ServiceModelOptions): boolean {
		if (model) {
			for (const key in model) {
				if (key !== 'image') {
					return true;
				}
			}
			return false;
		}
		return false;
	}

	function handleRunBtnClick(): void {
		const options: Card2DialogOptions = { serviceName: props.serviceName, formData: formData };
		if ('canModifyResultAfterApi' in props) {
			options['canModifyResultAfterApi'] = props.canModifyResultAfterApi;
		}
		props.openDialog(options);
	}

	function handleServiceAvl(): void {
		OverlayToaster.create({ position: Position.TOP })
			.show({
				message: <><p>You do not have permission to use this service.</p><p>Please contact admin.</p></>,
				intent: Intent.DANGER,
			});
	}

	return (
		<div className={styles.wrapper}>
			{/* Header */}
			<div className={styles.header} style={{ background: props.headerColor }} onClick={toggleToolKitCard}>
				<div className={styles.headerIcon}>{props.headerIcon}</div>
				<div>{props.toolKitTitle}</div>
				<div className={isOpen ? styles.arrowUp : styles.arrowDown}>
					{ArrowDown}
				</div>
			</div>

			{/* Body */}
			{isOpen && (
				<div className={styles.body}>
					{props.serviceName === "apply_LUT" && (
						<>
							<p>
								Please upload either <strong>style LUT</strong> or <strong>style image</strong>, but not both.
							</p>
							<br />
						</>
					)}
					
					{/* Panel */}
					{hasNonImageKeys(props.model) && (
						<>
							{paramsOrder.map((paramName: string, index: number) => {
								if (paramName !== 'image' && paramName !== 'content_image') {
									const settings = props.model[paramName];
									switch (settings['ui:widget']) {
										case 'range':
											return (
												<div key={index}>
													<MySlider
														{...settings}
														onChange={(value: number) => updateFormData(paramName, value)}
													/>
												</div>
											);
										case 'radio':
											return (
												<div key={index}>
													<MyRadio
														{...settings}
														onChange={(value: number) => updateFormData(paramName, value)}
													/>
												</div>
											);
										case 'select':
											return (
												<div key={index}>
													<MySelect
														{...settings}
														onChange={(value: number) => updateFormData(paramName, value)}
													/>
												</div>
											);
										case 'textarea':
											return (
												<div key={index}>
													<MyTextArea
														{...settings}
														onChange={(value: number) => updateFormData(paramName, value)}
													/>
												</div>
											);
										case 'switch':
											return (
												<div key={index}>
													<MySwitch
														{...settings}
														onChange={(value: number) => updateFormData(paramName, value)}
													/>
												</div>
											);
										case 'numericInput':
											return (
												<div key={index}>
													<MyNumericInput
														{...settings}
														onChange={(value: number) => updateFormData(paramName, value)}
													/>
												</div>
											);
										case 'file':
											return (
												<div key={index}>
													<MyFileInput
														{...settings}
														ref={(el) => (refs.current[paramName] = el)}
														onFileSelect={(value: File) => updateFormData(paramName, value)}
													/>
												</div>
											);
										default:
											return <p key={index}>{paramName}</p>;
									}
								}
							})}
							<Divider />
						</>
					)}
					{/* {props.serviceName === "apply_LUT" && (
						<>
							<Button className={styles.clearBtn} onClick={clearFileInputs}>Clear</Button>
							<br></br>
							</>
					)}
					 */}
					<Button className={styles.runBtn} onClick={handleRunBtnClick}>Run</Button>

					{/* Mask */}
					{!props.serviceAvl && <div className={styles.mask} onClick={handleServiceAvl}></div>}
				</div>
			)}
		</div>
	);
});

export default Container;
