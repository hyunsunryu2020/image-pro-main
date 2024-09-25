/**
 * The function of this component is to visually compare the difference
 * between the image before processing and the image after processing.
 */
import styles from './toolKitDialog.module.css';
import { useEffect, useRef, useState } from 'react';
import { int } from '@/common/utils/tools.ts';

interface ComparisonProps {
	oldImage: HTMLImageElement;
	newImage: HTMLImageElement;
	width: number;
	height: number;
	canModifyResultAfterApi?: boolean;
}

export default function Comparison(props: ComparisonProps): JSX.Element {
	useEffect(() => {
		if (props.oldImage && props.newImage) {
			drawImageOnCanvas('afterCanvas');
			drawImageOnCanvas('beforeCanvas', int(props.width * sliderPos / 100));
		}
	}, [props.oldImage, props.newImage]);

	// useEffect(() => {
	// 	const drawMixImageOnCanvas = async () => {
	// 		const img = await readImage(props.mixImageBase64);
	// 		// drawImageOnCanvas('afterCanvas');
	// 		const canvas = document.getElementById('afterCanvas') as HTMLCanvasElement;
	// 		canvas.width = props.width;
	// 		canvas.height = props.height;
	// 		const ctx = canvas.getContext('2d');
	// 		ctx.drawImage(img, 0, 0, props.width, props.height);
	// 	};
	// 	if (('canModifyResultAfterApi' in props) && props.mixImageBase64) {
	// 		drawMixImageOnCanvas().then(() => {
	// 			console.log('update canvas');
	// 		});
	// 	}
	// }, [props.mixImageBase64]);

	/**----------MouseMove Event----------**/
	const wrapperRef = useRef(null);
	const [sliderPos, setSliderPos] = useState<number>(50);

	function watchMouseMove(e: any): void {
		if (wrapperRef.current) {
			const { left, right } = wrapperRef.current.getBoundingClientRect();

			if (left < e.clientX && e.clientX < right) {
				const tmp: number = int((e.clientX + 2 - left) / (right - left) * 100);
				setSliderPos(tmp);
				drawImageOnCanvas('beforeCanvas', e.clientX + 2 - left);
				// mixTwoImagesInOneCanvas(e.clientX - left);
			}
		}
	}

	/**----------One Canvas----------**/

	// 📌 The screen drawing is not smooth enough and has a noticeable sense of delay.
	/**
	 * Mix the old Image and the new Image in the same canvas, where the old Image occupies the width of the @param
	 * width.
	 * @param width : number
	 */
	// function mixTwoImagesInOneCanvas(width: number): void {
	// 	if (props.oldImage && props.newImage) {
	// 		// read image
	// 		const oldPxMatrix = getCanvasPxMatrix(props.oldImage);
	// 		const newPxMatrix = getCanvasPxMatrix(props.newImage);
	// 		// mix two images
	// 		const mixPxMatrix = []; // Matrix[y][x] = [red, green, blue, alpha]
	// 		for (let y = 0; y < props.height; y++) {
	// 			const row = [];
	// 			for (let x = 0; x < props.width; x++) {
	// 				row.push(x <= width ? oldPxMatrix[y][x] : newPxMatrix[y][x]);
	// 			}
	// 			mixPxMatrix.push(row);
	// 		}
	// 		// recover Uint8ClampedArray(1D array) from 3D array
	// 		const pxArray: Uint8ClampedArray = new Uint8ClampedArray(4 * props.width * props.height);
	// 		for (let y = 0; y < props.height; y++) {
	// 			for (let x = 0; x < props.width; x++) {
	// 				const pixel = mixPxMatrix[y][x];
	// 				const index = (y * props.width + x) * 4;
	// 				pxArray[index] = pixel[0];
	// 				pxArray[index + 1] = pixel[1];
	// 				pxArray[index + 2] = pixel[2];
	// 				pxArray[index + 3] = pixel[3];
	// 			}
	// 		}
	// 		const imageData = new ImageData(pxArray, props.width, props.height);
	// 		// put image on canvas
	// 		const canvas = document.getElementById('canvas') as HTMLCanvasElement;
	// 		canvas.width = props.width;
	// 		canvas.height = props.height;
	// 		const ctx = canvas.getContext('2d');
	// 		ctx.putImageData(imageData, 0, 0);
	// 	}
	// }

	/**
	 * Transfer canvas ImageData['data'] from Uint8ClampedArray 1D Array to 3D Array.
	 * So you can access each pixel as a 2D matrix.
	 * @param image : HTMLImageElement
	 */
	// function getCanvasPxMatrix(image: HTMLImageElement): number[][][] {
	// 	const canvas = document.createElement('canvas');
	// 	canvas.width = props.width;
	// 	canvas.height = props.height;
	// 	const ctx = canvas.getContext('2d');
	// 	ctx.drawImage(image, 0, 0, props.width, props.height);
	//
	// 	const imageData = ctx.getImageData(0, 0, props.width, props.height);
	// 	const data = imageData.data;
	// 	const pixelMatrix = [];
	// 	for (let y = 0; y < canvas.height; y++) {
	// 		const row = [];
	// 		for (let x = 0; x < canvas.width; x++) {
	// 			const index = (y * canvas.width + x) * 4;
	// 			const red = data[index];
	// 			const green = data[index + 1];
	// 			const blue = data[index + 2];
	// 			const alpha = data[index + 3];
	// 			row.push([red, green, blue, alpha]);
	// 		}
	// 		pixelMatrix.push(row);
	// 	}
	//
	// 	return pixelMatrix;
	// }

	/**----------Two Canvases----------**/

	// 📌 During the process of moving the slider, the screen drawing is smoother compared to using a single canvas.
	/**
	 * draw image on canvas
	 * @param canvasId
	 * @param width
	 */
	function drawImageOnCanvas(canvasId: string, width?: number): void {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		canvas.width = canvasId === 'afterCanvas' ? props.width : width;
		canvas.height = props.height;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(canvasId === 'afterCanvas' ? props.newImage : props.oldImage, 0, 0, props.width, props.height);
	}


	return (
		<div ref={wrapperRef} className={styles.wrapper}
			 style={{ width: props.width, height: props.height }}
		>
			{/**----------One Canvas----------**/}
			{/*<canvas id="canvas"></canvas>*/}

			{/**----------Two Canvases----------**/}
			<canvas id="afterCanvas" className={styles.canvas}></canvas>
			<canvas id="beforeCanvas" className={styles.canvas}></canvas>

			<div className={styles.slider} style={{ 'left': `${sliderPos}%` }} onMouseMove={watchMouseMove}></div>
		</div>);
}