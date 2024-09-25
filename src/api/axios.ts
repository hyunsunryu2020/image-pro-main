import axios, { AxiosInstance } from 'axios';

const baseURL: string = process.env.NEXT_PUBLIC_ENV === 'development' ? process.env.NEXT_PUBLIC_BE_API : '/';

const request: AxiosInstance = axios.create({
	baseURL,
	headers: {
		'x-requested-with': 'XMLHttpRequest',
	},
});

export default request;