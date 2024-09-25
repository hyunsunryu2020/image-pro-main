import { StoreType } from 'polotno/model/store';


export function readImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve) => {
		const img: HTMLImageElement = new Image();
		img.src = src;
		img.crossOrigin = 'Anonymous';
		img.onload = () => {
			return resolve(img);
		};
	});
}

export function downloadFromBase64(src: string, fileName: string | number, imageType?: string): void {
	const link: HTMLAnchorElement = document.createElement('a');
	link.href = src;
	link.download = `${fileName}.${imageType || getImageFormatFromBase64(src)}`;
	link.click();
}

export function getImageFormatFromBase64(src: string): string {
	const startIdx = src.indexOf('/'),
		  endIdx   = src.indexOf(';');
	return src.slice(startIdx + 1, endIdx);
}

export function getMIMETypeFromBase64(src: string): string {
	return src.slice(5, src.indexOf(';base64'));
}

export function exportBase64FromCanvas(store: StoreType, id: number = 0, imageType?: string): Promise<string> {
	return new Promise(async (resolve) => {
		// 1. fix raw Image Object, which provides width, height, image format...
		const selectedEle = store.selectedElements[id];
		const rawImageObj: HTMLImageElement = await readImage(selectedEle.src);
		const imageFormat: string = getImageFormatFromBase64(selectedEle.src);
		// 2. copy selectedEle to another page
		store.history.transaction(async () => {
			const page = store.addPage();
			page.setSize({
				width: rawImageObj.width,
				height: rawImageObj.height,
				useMagic: true, // useMagic is true, all elements will be resized proportionally.
			});

			const ele = JSON.parse(JSON.stringify(selectedEle));
			ele.x = 0;
			ele.y = 0;
			ele.width = rawImageObj.width;
			ele.height = rawImageObj.height;

			page.addElement(ele);
			// 3. export page as base64 from canvas workspace
			// todo: use 3rd part tool to change image format
			const mimeType: 'image/png' | 'image/jpeg' = (imageType || imageFormat) === 'png'
														 ? 'image/png'
														 : 'image/jpeg';

			const src: string = await store.toDataURL({
				pixelRatio: 1,
				ignoreBackground: true,
				pageId: page.id,
				mimeType,
				includeBleed: false,
				quality: 1,
			});

			store.deletePages([page.id]);
			resolve(src);
		});
	});
}

export function isValidImageMIMEType(mimeType: string): boolean {
  const validMIMETypes = [".png", ".jpeg", ".gif", ".bmp", ".webp",".jpg"];
  return validMIMETypes.includes(mimeType);
};