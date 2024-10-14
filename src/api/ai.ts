import request from '@/api/axios';
import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import { AIServiceAPI, ModelFormDataType } from '@/common/types/AIServices';


/**
 * get all AI services list
 */
export async function AIServicesListApi(): Promise<AxiosResponse<Array<AIServiceAPI>, any>> {
	return request({
		url: '/api/ai-services',
		method: 'get',
	});
}

let cancelTokenSource: CancelTokenSource | null = null;



/**
 * use AI tool to process images
 */
interface AIFilterParams {
	image_url?: string, // ['SDXL_FreeU'] don't need
	service_name: string,
	modelParams: { [propName: string]: ModelFormDataType }
}

export interface AIFilterResponse {
	result: string; // base64 string
}

export async function AIFilterApi(data: AIFilterParams): Promise<AxiosResponse<AIFilterResponse, any>> {
	if (cancelTokenSource) {
        cancelTokenSource.cancel('Operation canceled due to new request.');
	}
	// Create a new CancelTokenSource for the new request
    cancelTokenSource = axios.CancelToken.source();
	const getParams = (params: { [propName: string]: ModelFormDataType }): string => {
		const res: { [propName: string]: ModelFormDataType } = { base64: '' };
		for (const key in params) {
			if (typeof params[key] === 'boolean') {
				res[key] = String(params[key]);
			} else {
				res[key] = params[key];
			}
		}
		if (data.service_name === 'SDXL_FreeU') {
			delete res['base64']
		}
		return JSON.stringify(res);
	};

	if (data.service_name === "get_LUT") {
		const requestData: { [propName: string]: string } = {
			service_name: data.service_name,
			params: JSON.stringify({ image: data.image_url, base64: data.image_url }),
		};
		console.log("requestData:", requestData);
		return request({
			url: '/api/ai-filter',
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				
			},
			data: JSON.stringify(requestData),
			cancelToken: cancelTokenSource.token,

		});

	}
	if (data.service_name === "apply_LUT") {
		const requestData: { [propName: string]: string } = {
			service_name: data.service_name,
			params: getParams(data.modelParams),
		};
		return request({
			url: '/api/ai-filter',
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				
			},
			data: JSON.stringify(requestData),
			cancelToken: cancelTokenSource.token,

		});
	}
	else {
		const requestData: { [propName: string]: string } = {
			service_name: data.service_name,
			params: getParams(data.modelParams),
		};
		console.log("requestData:", requestData);

		if (data.service_name !== 'SDXL_FreeU') {
			requestData['image_url'] = data.image_url;
		}
		return request({
			url: '/api/ai-filter',
			method: 'post',
			data: requestData,

		});
	}
}

/**
 * search images by text or image
 */
interface AITextSearchParams {
	query_string?: string;
	more_results?: boolean; // false (or not set) return first 50 results, true return 100 results.
}

export type AISearchParams = AITextSearchParams | FormData

export async function AISearchApi(data: AISearchParams): Promise<AxiosResponse<Array<string>, any>> {
	return request({
		url: '/api/semantic-search',
		method: 'post',
		data: data,
	});
}

/**
 * Segment Anything Api to get image embedding
 */
export async function AISamApi(image_url: string) {
	return request({
		url: '/api/ai-filter',
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify({ image_url }),
	});
}

export function cancelAIFilterRequest(): void {
	if (cancelTokenSource) {
        cancelTokenSource.cancel('Operation canceled by the user.');
        cancelTokenSource = null; // Reset the cancel token source after canceling
    }
}