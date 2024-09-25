/**
 * decimal function
 * @param num
 */
export function int(num: number): number {
	return ~~num;
}

export function isBase64(str: any): boolean {
	return str.indexOf('data:') != -1 && str.indexOf('base64') != -1;
}