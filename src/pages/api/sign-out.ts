import { NextApiRequest, NextApiResponse } from 'next';
import mockData from '../../../mock/sign-out.json';


interface SignOutResp {
	result: string;
}


export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<SignOutResp>,
) {
	res.status(200).json(mockData);
}