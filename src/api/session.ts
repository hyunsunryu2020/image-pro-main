import request from '@/api/axios';
import { AxiosResponse } from 'axios';


/**
 * User signs in website and registers a token on the BE.
 */
interface UserSignInParams {
	username: string;
	password: string;
}

export interface UserSignInData {
	username: string;
	tools: Array<string>;
	token: string;
}

export async function signInApi(params: UserSignInParams): Promise<AxiosResponse<UserSignInData, any>> {
	return request({
		url: '/api/sign-in',
		method: 'post',
		data: params,
	});
}

/**
 * Sign out this session and reset BE token.
 * */
export async function signOutApi(): Promise<AxiosResponse<null, any>> {
	return request({
		url: '/api/sign-out',
		method: 'post',
	});
}