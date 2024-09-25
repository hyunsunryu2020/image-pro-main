import * as React from 'react';
import { ModelFormDataType, ServiceModelOptions } from '@/common/types/AIServices.ts';


export interface CardContainerProps {
	serviceName: string; // AI services serviceName

	serviceAvl: boolean;
	toolKitTitle: string;
	headerIcon: JSX.Element;
	headerColor: string;

	model: ServiceModelOptions;
	settings: { [propName: string]: any };

	openDialog?: Function;


	bodyColor?: string;
	store?: any;
	bodyChildren?: React.ReactNode;
	runBtnHandler?: Function;
	applyBtnHandler?: Function;
	cancelBtnHandler?: Function;
	
}

export interface CardContainerTheme {
	header: { background: string };
	body: { background: string };
}

export interface ToolKitCardContainerProps {
	serviceName: string;
	serviceAvl: boolean;
	toolKitTitle: string;
	headerIcon: JSX.Element;
	headerColor: string;

	model: ServiceModelOptions;
	settings: { [propName: string]: any };

	openDialog?: Function;
	canModifyResultAfterApi?: boolean;
	ref?: React.Ref<{  clearFileInputs: () => void }>; 
	
}

export interface Card2DialogOptions {
	serviceName: string;
	formData: { [propName: string]: ModelFormDataType };
	canModifyResultAfterApi?: boolean;
}