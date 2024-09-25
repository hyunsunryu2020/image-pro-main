import styles from './toolKitDialog.module.css';
import { useEffect, useRef, useState } from 'react';
import { ModelFormDataType, ServiceModelOptions } from '@/common/types/AIServices.ts';
import { int } from '@/common/utils/tools.ts';
import { Button, Card, Dialog, DialogBody, DialogFooter, Elevation, Spinner } from '@blueprintjs/core';
import DefaultDisplay from '@/components/toolKitPanel/toolKitDialog/display.tsx';
import Comparison from '@/components/toolKitPanel/toolKitDialog/comparison.tsx';
import MySlider from '@/components/formComponents/slider';
import { cancelAIFilterRequest } from '@/api/ai';
import { Card2DialogOptions } from '../types';


interface ToolKitDialogProps {
	serviceName: string;
	toolKitTitle: string;
	headerIcon: JSX.Element;

	originalImageObj: HTMLImageElement; // fix, no change, save original raw image
	mixedImageObj: HTMLImageElement; // most of the time, it equals to processedImageObj, sometimes it is a mix result
									 // by image processing middleware function

	isDialogOpen: boolean;
	closeDialog: Function;
	dialogOptions: Card2DialogOptions;

	handleApplyBtn: Function;
	handleDownloadBtn: Function;

	canModifyResultAfterApi?: boolean;
	model: ServiceModelOptions;
	formData: { [propName: string]: ModelFormDataType };
	handleFormDataChange: Function;
}

export default function ToolKitDialog(props: ToolKitDialogProps): JSX.Element {
	/**----------Dialog Config----------**/
	const dialogProps = {
		icon: <div className={styles.dialogIcon}>{props.headerIcon}</div>,
		title: props.toolKitTitle,
		isOpen: props.isDialogOpen,

		canEscapeKeyClose: false,
		canOutsideClickClose: false,
		isCloseButtonShown: false,
	};

	/**----------Displayer Config----------**/
	const [isDialogLoading, setIsDialogLoading] = useState<boolean>(true);
	const [isCanvasLoading, setIsCanvasLoading] = useState<boolean>(true);
	const imageRef = useRef(null);
	const [canvasWH, setCanvasWH] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
	const [displayType, setDisplayType] = useState<string>('default'); // 'default', 'comparison', 'operation'
	const [cancelled, setCancelled] = useState<boolean>(false);

	
	useEffect(() => {
		// 当 Dom 渲染挂载之后，得到 imageRef 的宽高，
		if (imageRef.current && props.originalImageObj) {
			getCanvasWH();
			// 当图片加载完成之后，渲染 Canvas 组件
			setIsCanvasLoading(false);
		}
	}, [imageRef.current, props.originalImageObj]);

	function getCanvasWH(): void {
		const imageRefW     = imageRef.current.clientWidth,
			  imageRefH     = imageRef.current.clientHeight,
			  imageRefRatio = imageRefW / imageRefH, // > 1
			  imageRatio    = props.originalImageObj.width / props.originalImageObj.height;

		let w: number, h: number;
		if (imageRatio > 1) { // w > h
			if (imageRatio <= imageRefRatio) {
				h = imageRefH;
				w = h * imageRatio;
			} else {
				w = imageRefW;
				h = w / imageRatio;
			}
		} else if (imageRatio === 1) { // w === h
			w = h = imageRefH;
		} else if (imageRatio < 1) { // w < h
			h = imageRefH;
			w = h * imageRatio;
		}
		setCanvasWH({
			width: int(w),
			height: int(h),
		});
	}

	useEffect(() => {
		if (props.mixedImageObj) {
			setDisplayType('comparison');
			setIsDialogLoading(false);
			setShowApplyBtn(true);
		}
		if (props.serviceName == 'get_LUT') {
			setDisplayType('default');
			setIsDialogLoading(false);
			setShowDownloadBtn(true);
		}
	}, [props.mixedImageObj]);

	/**----------Dialog Footer----------**/
	const [showApplyBtn, setShowApplyBtn] = useState<boolean>(false);
	const [showDownloadBtn, setShowDownloadBtn] = useState<boolean>(false);
	const footerActions: JSX.Element = (
	<>
		{props.serviceName === "get_LUT" ? (
			<>
				{showDownloadBtn && <Button onClick={handleDownloadBtn}>Download</Button>}
				<Button onClick={handleCancelBtn}>Cancel</Button>
			</>
		) : (
			<>
				{showApplyBtn && <Button onClick={handleApplyBtn}>Apply</Button>}
				<Button onClick={handleCancelBtn}>Cancel</Button>
			</>
		)}
	</>
);

	
	function handleApplyBtn(): void {
		props.handleApplyBtn(props.mixedImageObj);
		handleCancelBtn();
	}

	function handleDownloadBtn(): void{
		props.handleDownloadBtn();
		handleCancelBtn();
	}

	function handleCancelBtn(): void {
		props.closeDialog(props.dialogOptions);
		clearDialog();
		setCancelled(true);
		cancelAIFilterRequest();
		console.log("handle cancel button");
	}

	function clearDialog(): void {
		setIsDialogLoading(true);
		setIsCanvasLoading(true);
		setDisplayType('default');
		setShowApplyBtn(false);
		setShowDownloadBtn(false);
	}

	/**----------Dialog Panel----------**/
	const [formState, setFormState] = useState<ServiceModelOptions>({});
	useEffect(() => {
		const tmp: ServiceModelOptions = {};
		for (const key in props.model) {
			if (key === 'image') continue;
			tmp[key] = Object.assign({}, props.model[key], { default: props.formData[key] });
		}
		setFormState(tmp);
	}, [props.model]);

	function updateFormData(key: string, value: ModelFormDataType): void {
		props.handleFormDataChange({ [key]: value });
	}


	return (
		<>
			<Dialog {...dialogProps} className={styles.dialogWrapper}>
				<DialogBody className={styles.dialogBody} useOverflowScrollContainer={false}>
					<div className={styles.canvasWrapper} ref={imageRef}>
						{!isCanvasLoading && displayType === 'default' &&
							<DefaultDisplay image={props.originalImageObj}
											width={canvasWH.width}
											height={canvasWH.height} />}
						{!isCanvasLoading && displayType === 'comparison' &&
							<Comparison oldImage={props.originalImageObj}
										newImage={props.mixedImageObj}
										width={canvasWH.width}
										height={canvasWH.height}
										canModifyResultAfterApi={props.canModifyResultAfterApi} />}
					</div>

					{isDialogLoading &&
						<div className={styles.spinnerMask}>
							<Spinner className={styles.spinner} />
						</div>
					}

					{props.canModifyResultAfterApi && props.mixedImageObj &&
						<Card interactive={true} elevation={Elevation.TWO} className={styles.panel}>
							{
								Object.keys(formState).map((paramName: string, index: number) => {
									const settings = formState[paramName];
									switch (settings['ui:widget']) {
										case 'range':
											return (
												<div key={index}>
													<MySlider {...settings}
															  onChange={(value: number) => updateFormData(paramName, value)}
													/>
												</div>);
									}
								})
							}
						</Card>}
				</DialogBody>

				<DialogFooter actions={footerActions} className={styles.dialogFooterMain}></DialogFooter>
			</Dialog>
		</>
	);
}

