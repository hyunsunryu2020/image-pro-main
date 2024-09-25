import { NextApiRequest, NextApiResponse } from 'next';
import mockData from '../../../mock/sig-in.json';


interface SignInResp {
	token: string,
	username: string,
	tools: Array<string>,
}


export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<SignInResp>,
) {
	res.status(200).json(mockData);
}