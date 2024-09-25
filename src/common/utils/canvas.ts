import { getMIMETypeFromBase64, readImage } from '@/common/utils/image.tsx';
import * as StackBlur from 'stackblur-canvas';


export function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');

	return [canvas, ctx];
}

export function addWatermarkToImage(imageSrc: string): Promise<string> {
	return new Promise(async (resolve) => {
		const image = await readImage(imageSrc);
		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		ctx.font = '15px Arial';
		ctx.fillStyle = 'rgba(255, 255, 255, .8)';

		/**----------single watermark----------**/
		// ctx.fillText('© S Lab Studio - Image Pro', 10, image.height - 10);
		// resolve(canvas.toDataURL());

		/**----------full screen watermark----------**/
		const watermarkText = new Array(15).fill('Watermark Text');
		const lineHeight = 10;
		const margin = 50;
		const startY = -(lineHeight * (watermarkText.length - 1) + margin * (watermarkText.length - 1)) / 2;

		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(7 * Math.PI / 4);

		for (let offset = 0; offset < image.width + 100; offset += 200) {
			for (let i = 0; i < watermarkText.length; i++) {
				let y = startY + i * (lineHeight + margin);
				ctx.fillText(watermarkText[i], 0 - Math.floor(image.width / 2) + offset, y);
			}
		}

		ctx.restore();
		resolve(canvas.toDataURL());
	});
}

export function blendImageByRatio(base: HTMLImageElement, surface: HTMLImageElement, ratio: number): string {
	const [baseCanvas, baseCtx] = createCanvas(base.width, base.height);
	baseCtx.drawImage(base, 0, 0, base.width, base.height);
	const [_, surfaceCtx] = createCanvas(surface.width, surface.height);
	surfaceCtx.drawImage(surface, 0, 0, surface.width, surface.height);

	const baseImageData = baseCtx.getImageData(0, 0, base.width, base.height);
	const surfaceImageData = surfaceCtx.getImageData(0, 0, surface.width, surface.height);

	for (let index = 0; index < baseImageData.data.length; index++) {
		baseImageData.data[index] = baseImageData.data[index] * (1 - ratio) + surfaceImageData.data[index] * ratio;
	}

	baseCtx.putImageData(baseImageData, 0, 0);
	return baseCanvas.toDataURL(getMIMETypeFromBase64(base.src), 1);
}

export function filterSepia(imgData: Uint8ClampedArray) {
	for (let index = 0; index < imgData.length; index += 4) {
		const r = imgData[index + 0],
			  g = imgData[index + 1],
			  b = imgData[index + 2];

		imgData[index + 0] = r * .39 + g * .76 + b * .18;
		imgData[index + 1] = r * .35 + g * .68 + b * .16;
		imgData[index + 2] = r * .27 + g * .53 + b * .13;
	}
}

export function filterGrayscale(imgData: Uint8ClampedArray) {
	for (let index = 0; index < imgData.length; index += 4) {
		// const average = (imgData[index + 0]
		// 	+ imgData[index + 1]
		// 	+ imgData[index + 2]) / 3;
		const average = (imgData[index + 0] * .3
			+ imgData[index + 1] * .6
			+ imgData[index + 2] * .1) / 3;

		imgData[index + 0] = average;
		imgData[index + 1] = average;
		imgData[index + 2] = average;
	}
}

export function filterTransparency(imgData: Uint8ClampedArray, opacity: number) {
	for (let index = 0; index < imgData.length; index += 4) {
		imgData[index + 3] = imgData[index + 3] * opacity;
	}
}

export function filterBrightness(imgData: Uint8ClampedArray, brightness: number) {
	for (let index = 0; index < imgData.length; index += 4) {
		const value = 255 * brightness;

		imgData[index + 0] += value;
		imgData[index + 1] += value;
		imgData[index + 2] += value;
	}
}

export function filterBlur(imageData: ImageData, width: number, height: number, radius: number) {
	return StackBlur.imageDataRGBA(imageData, 0, 0, width, height, radius);
}

export function addShadow(ctx: CanvasRenderingContext2D, shadowOffsetX: number, shadowOffsetY: number, shadowBlur: number, shadowColor: string, shadowOpacity: number) {
	ctx.shadowOffsetX = shadowOffsetX; // 阴影的水平偏移量
	ctx.shadowOffsetY = shadowOffsetY; // 阴影的垂直偏移量
	ctx.shadowBlur = shadowBlur;    // 阴影的模糊程度
	ctx.shadowColor = shadowColor.includes('rgba') ? shadowColor : convertToRGBA(shadowColor, shadowOpacity); // 阴影的颜色和透明
}

function convertToRGBA(color: string, alpha = 1) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = color;
	// 使用 Canvas 来解析颜色
	ctx.fillRect(0, 0, 1, 1);
	const data = ctx.getImageData(0, 0, 1, 1).data;
	// 返回 rgba 形式的颜色值
	return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${alpha})`;
}

export function flipImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, horizontal: boolean, vertical: boolean) {
	if (horizontal) {
		ctx.scale(-1, 1);
		ctx.translate(-img.width, 0);
	}
	if (vertical) {
		ctx.scale(1, -1);
		ctx.translate(0, -img.height);
	}
	ctx.drawImage(img, 0, 0, img.width, img.height);
}

export function cropImage(image: HTMLImageElement, ele: any, oldCanvas: HTMLCanvasElement) {
	const [canvas, ctx] = createCanvas(image.width * ele.cropWidth, image.height * ele.cropHeight);
	ctx.drawImage(oldCanvas, image.width * ele.cropX, image.height * ele.cropY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL(getMIMETypeFromBase64(image.src), 1);
}

export async function handleFilter(ele: any, watermarkEnabled: boolean): Promise<string> {
	return new Promise(async (resolve) => {
		const image = await readImage(ele.src);
		const [canvas, ctx] = createCanvas(image.width, image.height);

		ele.shadowEnabled && addShadow(ctx, ele.shadowOffsetX, ele.shadowOffsetY, ele.shadowBlur, ele.shadowColor, ele.shadowOpacity);
		ctx.drawImage(image, 0, 0, image.width, image.height);
		const imgData = ctx.getImageData(0, 0, image.width, image.height);

		ele.sepiaEnabled && filterSepia(imgData.data);
		ele.grayscaleEnabled && filterGrayscale(imgData.data);
		ele.opacity !== 1 && filterTransparency(imgData.data, ele.opacity);
		ele.brightness !== 1 && filterBrightness(imgData.data, ele.brightness);
		if (ele.blurEnabled) {
			const newImgData = filterBlur(imgData, image.width, image.height, ele.blurRadius);
			ctx.putImageData(newImgData, 0, 0);
		}
		(ele.flipX || ele.flipY) && flipImage(ctx, image, ele.flipX, ele.flipY);
		ctx.putImageData(imgData, 0, 0);

		if (ele.cropX !== 0 || ele.cropY !== 0) {
			resolve(watermarkEnabled
					? addWatermarkToImage(cropImage(image, ele, canvas))
					: cropImage(image, ele, canvas));
		} else {
			resolve(watermarkEnabled
					? addWatermarkToImage(canvas.toDataURL(getMIMETypeFromBase64(image.src), 1))
					: canvas.toDataURL(getMIMETypeFromBase64(image.src), 1));
		}
	});
}