// api: ai-services
/**
 * data structure only in the API response
 */
export interface AIServiceAPI {
	category: string;
	content: string; // 'panel' || 'toolkit'
	displayName: string;
	iconKey: string;
	serviceName: string;
	serviceOn: boolean;
	serviceUrl: string;
	jsonSchema: string;
	uiSchema: string;
	outputExample: string;
}

/**
 * AI service options to init panel and toolkit
 */
export interface AIServiceOptions {
	displayName: string;
	serviceName: string;
	serviceAvl: boolean;
	model: ServiceModelOptions; // properties + ui:widget
	settings: { [propName: string]: any }; // other settings in jsonSchema & uiSchema
}

/**
 * AI service model options
 */
export interface ServiceModelOptions {
	[propName: string]: ModelState;
}

/**
 * definition of each property
 */
export interface ModelState {
	type: string; // type of property
	title: string;
	default: ModelFormDataType;
	'ui:widget': string;
	required?: boolean;

	[propName: string]: any;
}

export type ModelFormDataType = string | number | boolean | File