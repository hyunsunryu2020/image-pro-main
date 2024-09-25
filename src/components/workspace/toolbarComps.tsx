import React, { useState } from 'react';
import { StoreType } from 'polotno/model/store';
import { Button, Popover } from '@blueprintjs/core';
import cv from '@techstark/opencv-js';
import { createCanvas } from '@/common/utils/canvas.ts';
import { readImage } from '@/common/utils/image.tsx';
import MySlider from '@/components/formComponents/slider';


const ImageToolBar = (props: { store: StoreType }) => {
	const store = props.store;

	async function handleClick() {
		const ele = store.selectedElements[0];
		console.log(ele.id);

		const image = await readImage(ele.src);
		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);
		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = new cv.Mat();

		// cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

		// cv.threshold(src, dst, 177, 200, cv.THRESH_BINARY);

		// cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
		// cv.adaptiveThreshold(src, dst, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 3, 2);

		// let M = cv.Mat.eye(3, 3, cv.CV_32FC1);
		// let anchor = new cv.Point(-1, -1);
		// cv.filter2D(src, dst, cv.CV_8U, M, anchor, 0, cv.BORDER_DEFAULT);

		// let ksize = new cv.Size(3, 3);
		// let anchor = new cv.Point(-1, -1);
		// cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
		// cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)

		// let ksize = new cv.Size(3, 3);
		// cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);

		let M = cv.Mat.ones(x, x, cv.CV_8U);
		let anchor = new cv.Point(-1, -1);
		cv.erode(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

		// let M = cv.Mat.ones(5, 5, cv.CV_8U);
		// let anchor = new cv.Point(-1, -1);
		// cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

		// let M = cv.Mat.ones(5, 5, cv.CV_8U);
		// let anchor = new cv.Point(-1, -1);
		// cv.morphologyEx(src, dst, cv.MORPH_OPEN, M, anchor, 1, cv.BORDER_CONSTANT,
		// cv.morphologyDefaultBorderValue());

		// cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
		// cv.Sobel(src, dst, cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
		// cv.Sobel(src, dst, cv.CV_8U, 0, 1, 3, 1, 0, cv.BORDER_DEFAULT);
		// cv.Scharr(src, dstx, cv.CV_8U, 1, 0, 1, 0, cv.BORDER_DEFAULT);
		// cv.Scharr(src, dsty, cv.CV_8U, 0, 1, 1, 0, cv.BORDER_DEFAULT);

		// cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
		// cv.Laplacian(src, dst, cv.CV_8U, 1, 1, 0, cv.BORDER_DEFAULT);

		// cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
		// cv.Canny(src, dst, 50, 100, 3, false);

		// let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
		// cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
		// cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
		// let contours = new cv.MatVector();
		// let hierarchy = new cv.Mat();
		// // You can try more different parameters
		// cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
		// // draw contours with random Scalar
		// for (let i = 0; i < contours.size(); ++i) {
		// 	let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
		// 		Math.round(Math.random() * 255));
		// 	cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
		// }

		// cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
		// cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
		// cv.transpose(src, dst);

		// cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
		// let srcVec = new cv.MatVector();
		// srcVec.push_back(src);
		// let accumulate = false;
		// let channels = [2];
		// let histSize = [256];
		// let ranges = [0, 255];
		// let hist = new cv.Mat();
		// let mask = new cv.Mat();
		// let color = new cv.Scalar(255, 255, 255);
		// let scale = 2;
		// // You can try more different parameters
		// cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
		// let result = cv.minMaxLoc(hist, mask);
		// let max = result.maxVal;
		// let dst = new cv.Mat.zeros(src.rows, histSize[0] * scale, cv.CV_8UC3);
		// // draw histogram
		// for (let i = 0; i < histSize[0]; i++) {
		// 	let binVal = hist.data32F[i] * src.rows / max;
		// 	let point1 = new cv.Point(i * scale, src.rows - 1);
		// 	let point2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
		// 	cv.rectangle(dst, point1, point2, color, cv.FILLED);
		// }


		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();
		const outputSrc = canvas.toDataURL();

		// const axis = store.selectedElements[0];
		// store.activePage.addElement({
		// 	type: 'image',
		// 	src: outputSrc,
		// 	x: axis.x + 50,
		// 	y: axis.y + 50,
		// 	width: 400,
		// 	height: 400,
		// });

		ele.set({ src: outputSrc });
	}

	const [x, setX] = useState(0);

	function print() {
		console.log(props.store);
	}

	return (
		<Popover
			content={
				<div style={{ width: '300px', padding: '20px' }}>
					<Button onClick={print} fill style={{ marginBottom: '20px' }}>OpenCV</Button>
					<MySlider default={x} onChange={(value: number) => {
						setX(value);
						handleClick();
					}} />
				</div>
			}
			placement={'bottom-start'}
		>
			<Button>Run</Button>
		</Popover>
	);
};


export default ImageToolBar;