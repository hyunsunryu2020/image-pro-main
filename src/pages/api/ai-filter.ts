import { NextApiRequest, NextApiResponse } from 'next';
import mockData from '../../../mock/ai-filter.json';


interface AIFilterResp {
	result: string;
}


export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<AIFilterResp>,
) {
	res.status(200).json(mockData);
}