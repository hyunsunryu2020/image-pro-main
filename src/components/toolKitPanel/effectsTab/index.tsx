import { StoreType } from 'polotno/model/store';
import styles from './effectsTab.module.css';
import { AdjustOptIcon, BasicOptIcon, FiltersOptIcon } from '@/components/icons';
import { useEffect, useRef, useState } from 'react';
import { Slider, Switch } from '@blueprintjs/core';
import { readImage } from '@/common/utils/image.tsx';
import { createCanvas, filterBrightness } from '@/common/utils/canvas.ts';
import SpatialBoard from '../../spatialBoard';
import cv from '@techstark/opencv-js';
import SpectralBoard from '../../spectralBoard';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';


export default function MyImageFiltersPanel(props: { store: StoreType, konvaStage: Konva.Stage }): JSX.Element {
	const store = props.store;
	const stage = props.konvaStage;

	useEffect(() => {
		const ele = store.selectedElements[0];
		setBlurEnabled(ele.blurEnabled);
		setBlurRadius(ele.blurRadius);
		setBrightnessEnabled(ele.brightnessEnabled);
		setLightnessEnabled(true);
		setBrightness(ele.brightness);
		setSepiaEnabled(ele.sepiaEnabled);
		setGrayscaleEnabled(ele.grayscaleEnabled);

	}, []);
// 

	/**
	 * Blur
	 */
	const [blurEnabled, setBlurEnabled] = useState<boolean>(false);
	const [blurRadius, setBlurRadius] = useState<number>(10);

	function handleBlurEnabled(e: any) {
		setBlurEnabled(e.target.checked);
		const activeEle = store.selectedElements[0];
		activeEle.set({ blurEnabled: e.target.checked });
	}

	function handleBlurRadius(value: number) {
		setBlurRadius(value);
		const activeEle = store.selectedElements[0];
		activeEle.set({ blurRadius: value });
	}

	/**
	 * Brightness
	 */
	const [brightnessEnabled, setBrightnessEnabled] = useState<boolean>(false);
	const [brightness, setBrightness] = useState<number>(0);

	function handleBrightnessEnabled(e: any) {
		setBrightnessEnabled(e.target.checked);
		console.log("e.target.checked", e.target.checked);
		const activeEle = store.selectedElements[0];
		activeEle.set({ brightnessEnabled: e.target.checked });
	}

	function handleBrightness(value: number) {
		setBrightness(value);
		const activeEle = store.selectedElements[0];
		activeEle.set({ brightness: value });
	}

	/**
	 * Sepia
	 */
	const [sepiaEnabled, setSepiaEnabled] = useState<boolean>(false);

	function handleSepiaEnabled(e: any) {
		setSepiaEnabled(e.target.checked);
		const activeEle = store.selectedElements[0];
		activeEle.set({ sepiaEnabled: e.target.checked });
	}

	/**
	 * Grayscale
	 */
	const [grayscaleEnabled, setGrayscaleEnabled] = useState<boolean>(false);

	function handleGrayscaleEnabled(e: any) {
		setGrayscaleEnabled(e.target.checked);
		const activeEle = store.selectedElements[0];
		activeEle.set({ grayscaleEnabled: e.target.checked });
	}

	/**
	 * Shadow
	 */

	/**
	 * Contrast
	 * ele.contrastEnabled: <boolean>
	 * ele.contrast: <number> -100 ~ 100
	 * ele.contrastImageSrc: Image Object
	 */
	const [contrastEnabled, setContrastEnabled] = useState<boolean>(false);
	const [contrast, setContrast] = useState<number>(0);

	async function handleContrastEnabled(e: any) {
		const value = e.target.checked;
		setContrastEnabled(value);

		const activeEle = store.selectedElements[0];
		activeEle.set({ contrastEnabled: value });

		if (value) { // apply contrast effect
			await handleContrast(contrast);
		} else { // reset
			await handleContrast(0);
		}
	}

	function contrastAdjustment(src: cv.Mat, percent: number): cv.Mat {
		const alpha = percent / 100;

		const temp = new cv.Mat();
		src.copyTo(temp);

		const row = src.rows;
		const col = src.cols;
		const threshold = 127;

		for (let i = 0; i < row; i++) {
			const t = temp.ptr(i);
			const s = src.ptr(i);

			for (let j = 0; j < col; j++) {
				const r = s[4 * j + 2];
				const g = s[4 * j + 1];
				const b = s[4 * j];

				let newB, newG, newR;

				if (alpha === 1) {
					t[4 * j + 2] = r > threshold ? 255 : 0;
					t[4 * j + 1] = g > threshold ? 255 : 0;
					t[4 * j] = b > threshold ? 255 : 0;
					continue;
				} else if (alpha >= 0) {
					newR = Math.round(threshold + (r - threshold) / (1 - alpha));
					newG = Math.round(threshold + (g - threshold) / (1 - alpha));
					newB = Math.round(threshold + (b - threshold) / (1 - alpha));
				} else {
					newR = Math.round(threshold + (r - threshold) * (1 + alpha));
					newG = Math.round(threshold + (g - threshold) * (1 + alpha));
					newB = Math.round(threshold + (b - threshold) * (1 + alpha));
				}

				newR = Math.max(0, Math.min(255, newR));
				newG = Math.max(0, Math.min(255, newG));
				newB = Math.max(0, Math.min(255, newB));

				t[4 * j + 3] = s[4 * j + 3]; // alpha
				t[4 * j + 2] = newR;
				t[4 * j + 1] = newG;
				t[4 * j] = newB;
			}
		}

		return temp;
	}

	async function handleContrast(value: number) {
		const activeEle = store.selectedElements[0];

		let image: HTMLImageElement;
		if ('contrastImageSrc' in activeEle) {
			image = activeEle.contrastImageSrc;
		} else {
			image = await readImage(activeEle.src);
			activeEle.set({ contrastImageSrc: image });
		}

		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = contrastAdjustment(src, value);
		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();
		const outputSrc = canvas.toDataURL();
		// todo: 给 src 赋值的时候，有图片加载。需要提升使用体验
		activeEle.set({ src: outputSrc, contrast: value });
	}

	/**
	 * Lightness
	 */
	const [lightnessEnabled, setLightnessEnabled] = useState<boolean>(true);
	const [lightness, setLightness] = useState<number>(0);

	async function handleLightnessEnabled(e: any) {
		const value = e.target.checked;
		setLightnessEnabled(value);

		const activeEle = store.selectedElements[0];
		activeEle.set({ lightnessEnabled: value });

		if (value) { // apply contrast effect
			await handleLightness(lightness);
		} else { // reset
			await handleLightness(0);
		}
	}

	function lightnessAdjustment(src: cv.Mat, percent: number): cv.Mat {
		const alpha = percent / 100;

		const temp = new cv.Mat();
		src.copyTo(temp); // copy alpha channel

		const row = src.rows;
		const col = src.cols;

		for (let i = 0; i < row; i++) {
			const t = temp.ptr(i);
			const s = src.ptr(i);

			for (let j = 0; j < col; j++) {
				const r = s[4 * j + 2];
				const g = s[4 * j + 1];
				const b = s[4 * j];

				if (alpha >= 0) {
					t[4 * j + 2] = r * (1 - alpha) + 255 * alpha;
					t[4 * j + 1] = g * (1 - alpha) + 255 * alpha;
					t[4 * j] = b * (1 - alpha) + 255 * alpha;
				} else {
					t[4 * j + 2] = r * (1 + alpha);
					t[4 * j + 1] = g * (1 + alpha);
					t[4 * j] = b * (1 + alpha);
				}
			}
		}

		return temp;
	}

	async function handleLightness(value: number) {
		const activeEle = store.selectedElements[0];

		let image: HTMLImageElement;
		if ('lightnessImageSrc' in activeEle) {
			image = activeEle.lightnessImageSrc;
		} else {
			image = await readImage(activeEle.src);
			activeEle.set({ lightnessImageSrc: image });
		}

		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = lightnessAdjustment(src, value);
		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();
		const outputSrc = canvas.toDataURL();
		activeEle.set({ src: outputSrc, lightness: value });
	}

	/**
	 * Highlight
	 */
	const [highlightEnabled, setHighlightEnabled] = useState<boolean>(false);
	const [highlight, setHighlight] = useState<number>(0);

	async function handleHighlightEnabled(e: any) {
		const value = e.target.checked;
		setHighlightEnabled(value);

		const activeEle = store.selectedElements[0];
		activeEle.set({ highlightEnabled: value });

		if (value) { // apply highlight effect
			await handleHighlight(highlight);
		} else { // reset
			await handleHighlight(0);
		}
	}

	function highlightAdjustment(input: cv.Mat, light: number) {
		console.log(checkMatType(input.type()));
		// console.time('highlightAdjustment');
		// 生成灰度图
		const gray = new cv.Mat(input.size(), cv.CV_32FC1);
		cv.cvtColor(input, gray, cv.COLOR_RGBA2GRAY, 0);

		// 确定高光区
		let thresh = gray.clone();
		cv.multiply(gray, gray, thresh);

		// 取平均值作为阈值
		const mean = cv.mean(thresh);
		const mask = new cv.Mat(gray.size(), cv.CV_8UC1);
		cv.threshold(thresh, mask, mean[0], 255, cv.THRESH_BINARY);

		// 参数设置
		const max = 4;
		const bright = light / 100 / max;
		const mid = 1 + max * bright * 0.75;

		// 边缘平滑过渡
		const ROWS = mask.rows,
			  COLS = mask.cols;
		const midRate = cv.Mat.zeros(input.size(), cv.CV_32FC1);
		const brightRate = cv.Mat.zeros(input.size(), cv.CV_32FC1);
		// mask255 & mask0
		const constantMask = new cv.Mat(ROWS, COLS, cv.CV_32FC1, new cv.Scalar(255));
		const onesMask = cv.Mat.ones(ROWS, COLS, cv.CV_32FC1);
		const mask255 = mask.clone();
		mask255.convertTo(mask255, cv.CV_32FC1);
		const mask0 = new cv.Mat(ROWS, COLS, cv.CV_32FC1);
		cv.subtract(constantMask, mask255, mask0);
		cv.multiply(mask255, onesMask, mask255, 1 / 255);
		cv.multiply(mask0, onesMask, mask0, 1 / 255);
		// midRate
		const constA = new cv.Mat(ROWS, COLS, cv.CV_32FC1, new cv.Scalar(mid));
		const constB = new cv.Mat(ROWS, COLS, cv.CV_32FC1, new cv.Scalar((mid - 1) / mean[0]));
		const temp1 = new cv.Mat(ROWS, COLS, cv.CV_32FC1); // mask255
		const temp2 = new cv.Mat(ROWS, COLS, cv.CV_32FC1); // mask0
		// 将 mask 中对应 255 的部分设为 a
		cv.multiply(mask255, constA, temp1);
		// 计算 mask 中对应 0 的部分，然后乘上 constB，对应位置为 b*thresh + 1
		const thresh32F = thresh.clone();
		thresh32F.convertTo(thresh32F, cv.CV_32FC1);
		cv.multiply(constB, thresh32F, temp2);
		cv.add(temp2, onesMask, temp2);
		cv.multiply(mask0, temp2, temp2);
		cv.add(temp1, temp2, midRate); // 将两部分相加，得到最终的 midRate
		// brightRate
		const temp3 = new cv.Mat(ROWS, COLS, cv.CV_32FC1); // mask255
		const temp4 = new cv.Mat(ROWS, COLS, cv.CV_32FC1); // mask0
		cv.multiply(mask255, onesMask, temp3, bright);
		cv.multiply(mask0, thresh32F, temp4, bright / mean[0]);
		cv.add(temp3, temp4, brightRate); // 将两部分相加，得到最终的 brightRate

		// 高光提亮，获取结果图
		const result32FC3 = new cv.Mat(input.size(), cv.CV_32FC3);
		const midRate32FC3 = new cv.Mat();
		const tmpMats = new cv.MatVector();
		tmpMats.push_back(midRate);
		tmpMats.push_back(midRate);
		tmpMats.push_back(midRate);
		cv.merge(tmpMats, midRate32FC3);
		const brightRate32FC3 = new cv.Mat();
		const tmpMats1 = new cv.MatVector();
		tmpMats1.push_back(brightRate);
		tmpMats1.push_back(brightRate);
		tmpMats1.push_back(brightRate);
		cv.merge(tmpMats1, brightRate32FC3);

		const input32FC4 = new cv.Mat();
		input.convertTo(input32FC4, cv.CV_32FC4);
		const input32FC3 = new cv.Mat();
		cv.cvtColor(input32FC4, input32FC3, cv.COLOR_RGBA2RGB);

		cv.multiply(input32FC3, midRate32FC3, input32FC3);
		cv.add(input32FC3, brightRate32FC3, input32FC3);

		const result = new cv.Mat(input.size(), input.type());
		cv.threshold(input32FC3, result32FC3, 255, 255, cv.THRESH_TRUNC);

		const result8UC3 = new cv.Mat();
		result32FC3.convertTo(result8UC3, cv.CV_8UC3);

		const alpha = cv.Mat.ones(input.size(), cv.CV_8UC1);
		cv.multiply(alpha, cv.Mat.ones(input.size(), cv.CV_8UC1), alpha, 255);
		const rgbMats = new cv.MatVector();
		const rgbaMats = new cv.MatVector();
		cv.split(result8UC3, rgbMats);
		rgbaMats.push_back(rgbMats.get(0));
		rgbaMats.push_back(rgbMats.get(1));
		rgbaMats.push_back(rgbMats.get(2));
		rgbaMats.push_back(alpha);
		cv.merge(rgbaMats, result);

		gray.delete();
		thresh.delete();
		mask.delete();
		midRate.delete();
		brightRate.delete();
		constantMask.delete();
		onesMask.delete();
		mask255.delete();
		mask0.delete();
		constA.delete();
		constB.delete();
		temp1.delete();
		temp2.delete();
		thresh32F.delete();
		temp3.delete();
		temp4.delete();
		result32FC3.delete();
		midRate32FC3.delete();
		tmpMats.delete();
		brightRate32FC3.delete();
		tmpMats1.delete();
		input32FC4.delete();
		input32FC3.delete();
		result8UC3.delete();
		alpha.delete();
		rgbMats.delete();
		rgbaMats.delete();

		return result;
	}

	function checkMatType(type: number) {
		const depth = type & 7;
		const channels = 1 + (type >> 3);

		let depthString;

		switch (depth) {
			case cv.CV_8U:
				depthString = '8U';
				break;
			case cv.CV_8S:
				depthString = '8S';
				break;
			case cv.CV_16U:
				depthString = '16U';
				break;
			case cv.CV_16S:
				depthString = '16S';
				break;
			case cv.CV_32S:
				depthString = '32S';
				break;
			case cv.CV_32F:
				depthString = '32F';
				break;
			case cv.CV_64F:
				depthString = '64F';
				break;
			default:
				throw new Error('Unsupported depth: ' + depth);
		}
		return 'Mat type is CV_' + depthString + 'C' + channels;
	}

	async function handleHighlight(value: number) {
		const activeEle = store.selectedElements[0];

		let image: HTMLImageElement;
		if ('highlightImageSrc' in activeEle) {
			image = activeEle.highlightImageSrc;
		} else {
			image = await readImage(activeEle.src);
			activeEle.set({ highlightImageSrc: image });
		}
		if (value === 0) {
			activeEle.set({ src: image.src, highlight: value });
			return;
		}

		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = highlightAdjustment(src, value);
		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();
		const outputSrc = canvas.toDataURL();
		activeEle.set({ src: outputSrc, highlight: value });
	}

	/**
	 * Sharpen
	 */
	const [sharpenEnabled, setSharpenEnabled] = useState<boolean>(false);
	const [sharpen, setSharpen] = useState<number>(0);

	async function handleSharpenEnabled(e: any) {
		const value = e.target.checked;
		setSharpenEnabled(value);

		const activeEle = store.selectedElements[0];
		activeEle.set({ sharpenEnabled: value });

		if (value) { // apply to sharpen effect
			await handleSharpen(sharpen);
		} else { // reset
			await handleSharpen(0);
		}
	}

	function sharpenAdjustment(src: cv.Mat, percent: number): cv.Mat {
		const result = new cv.Mat();
		const kernel = cv.matFromArray(3, 3, cv.CV_32F, [-1, -1, -1, -1, 9 + percent, -1, -1, -1, -1]);
		cv.filter2D(src, result, -1, kernel);
		kernel.delete();
		return result;
	}

	async function handleSharpen(value: number) {
		const activeEle = store.selectedElements[0];

		let image: HTMLImageElement;
		if ('sharpenImageSrc' in activeEle) {
			image = activeEle.sharpenImageSrc;
		} else {
			image = await readImage(activeEle.src);
			activeEle.set({ sharpenImageSrc: image });
		}

		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = sharpenAdjustment(src, value);
		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();
		const outputSrc = canvas.toDataURL();
		activeEle.set({ src: outputSrc, sharpen: value });
	}

	/**
	 * Saturation
	 */
	const [saturationEnabled, setSaturationEnabled] = useState<boolean>(false);
	const [saturation, setSaturation] = useState<number>(0);

	async function handleSaturationEnabled(e: any) {
		const value = e.target.checked;
		setSaturationEnabled(value);

		const activeEle = store.selectedElements[0];
		activeEle.set({ saturationEnabled: value });

		if (value) { // apply to saturation effect
			await handleSaturation(saturation);
		} else { // reset
			await handleSaturation(0);
		}
	}

	function saturationAdjustment(src: cv.Mat, percent: number): cv.Mat {
		const increment = percent / 100;
		const temp = src.clone();
		const row = src.rows,
			  col = src.cols;
		for (let i = 0; i < row; i++) {
			const t = temp.ptr(i);
			const s = src.ptr(i);
			for (let j = 0; j < col; j++) {
				const r     = s[4 * j + 2],
					  g     = s[4 * j + 1],
					  b     = s[4 * j],
					  max   = max3(r, g, b),
					  min   = min3(r, g, b),
					  delta = (max - min) / 255;
				// 灰点不做处理
				if (delta === 0) {
					continue;
				}

				const value = (max + min) / 255,
					  L     = value / 2;
				let S;
				if (L < 0.5) {
					S = delta / value;
				} else {
					S = delta / (2 - value);
				}

				let alpha;
				if (increment >= 0) {
					if ((increment + S) >= 1) {
						alpha = S;
					} else {
						alpha = 1 - increment;
					}
					alpha = 1 / alpha - 1;
					t[4 * j + 2] = r + (r - L * 255) * alpha;
					t[4 * j + 1] = g + (g - L * 255) * alpha;
					t[4 * j] = b + (b - L * 255) * alpha;
				} else {
					alpha = increment;
					t[4 * j + 2] = L * 255 + (r - L * 255) * (1 + alpha);
					t[4 * j + 1] = L * 255 + (g - L * 255) * (1 + alpha);
					t[4 * j] = L * 255 + (b - L * 255) * (1 + alpha);
				}
				t[4 * j + 3] = s[4 * j + 3];
			}
		}

		return temp;
	}

	function max3(a: number, b: number, c: number): number {
		const max2 = (a: number, b: number): number => (a > b ? a : b);
		return (a > b ? max2(a, c) : max2(b, c));
	}

	function min3(a: number, b: number, c: number): number {
		const min2 = (a: number, b: number) => (a < b ? a : b);
		return (a < b ? min2(a, c) : min2(b, c));
	}


	async function handleSaturation(value: number) {
		const activeEle = store.selectedElements[0];

		let image: HTMLImageElement;
		if ('sharpenImageSrc' in activeEle) {
			image = activeEle.sharpenImageSrc;
		} else {
			image = await readImage(activeEle.src);
			activeEle.set({ sharpenImageSrc: image });
		}

		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = saturationAdjustment(src, value);
		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();
		const outputSrc = canvas.toDataURL();
		activeEle.set({ src: outputSrc, saturation: value });
	}

	/**
	 * ColorTemperature
	 */
	const [colorTemperatureEnabled, setColorTemperatureEnabled] = useState<boolean>(false);
	const [colorTemperature, setColorTemperature] = useState<number>(0);

	async function handleColorTemperatureEnabled(e: any) {
		const value = e.target.checked;
		setColorTemperatureEnabled(value);

		const activeEle = store.selectedElements[0];
		activeEle.set({ colorTemperatureEnabled: value });

		if (value) { // apply to colorTemperature effect
			await handleColorTemperature(colorTemperature);
		} else { // reset
			await handleColorTemperature(0);
		}
	}

	function colorTintAdjustment(src: cv.Mat, adjustmentLevel: number): cv.Mat {
    const result = src.clone(),
          row    = src.rows,
          col    = src.cols;

    for (let i = 0; i < row; i++) {
        const a = src.ptr(i);
        const r = result.ptr(i);
        for (let j = 0; j < col; j++) {
            let R, G, B;
			const adjustedLevel = adjustmentLevel * 0.4;
            // R
            R = a[j * 4 + 2] - adjustedLevel ;
            if (R > 255) {
                r[j * 4 + 2] = 255;
            } else if (R < 0) {
                r[j * 4 + 2] = 0;
            } else {
                r[j * 4 + 2] = R;
            }
            
            // G
            G = a[j * 4 + 1] + adjustedLevel;
            if (G > 255) {
                r[j * 4 + 1] = 255;
            } else if (G < 0) {
                r[j * 4 + 1] = 0;
            } else {
                r[j * 4 + 1] = G;
            }
            
            // B
            B = a[j * 4] - adjustedLevel;
            if (B > 255) {
                r[j * 4] = 255;
            } else if (B < 0) {
                r[j * 4] = 0;
            } else {
                r[j * 4] = B;
            }
            
            r[j * 4 + 3] = a[j * 4 + 3];
        }
    }

    return result;
}

	function colorTemperatureAdjustment(src: cv.Mat, n: number): cv.Mat {
		const result = src.clone(),
			  row    = src.rows,
			  col    = src.cols,
			  level  = Math.floor(n / 2);

		for (let i = 0; i < row; i++) {
			const a = src.ptr(i);
			const r = result.ptr(i);
			for (let j = 0; j < col; j++) {
				let R, G, B;
				// R 通道
				R = a[j * 4 + 2] + level;
				if (R > 255) {
					r[j * 4 + 2] = 255;
				} else if (R < 0) {
					r[j * 4 + 2] = 0;
				} else {
					r[j * 4 + 2] = R;
				}
				// G 通道
				G = a[j * 4 + 1] + level;
				if (G > 255) {
					r[j * 4 + 1] = 255;
				} else if (G < 0) {
					r[j * 4 + 1] = 0;
				} else {
					r[j * 4 + 1] = G;
				}
				// B 通道
				B = a[j * 4] - level;
				if (B > 255) {
					r[j * 4] = 255;
				} else if (B < 0) {
					r[j * 4] = 0;
				} else {
					r[j * 4] = B;
				}
				r[j * 4 + 3] = a[j * 4 + 3];
			}
		}

		return result;
	}

	async function handleColorTemperature(value: number) {
		const activeEle = store.selectedElements[0];

		let image: HTMLImageElement;
		if ('colorTemperatureImageSrc' in activeEle) {
			image = activeEle.colorTemperatureImageSrc;
		} else {
			image = await readImage(activeEle.src);
			activeEle.set({ colorTemperatureImageSrc: image });
		}

		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = colorTemperatureAdjustment(src, value);
		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();
		const outputSrc = canvas.toDataURL();
		activeEle.set({ src: outputSrc, colorTemperature: value });
	}

	const [spatialCoordinates, setSpatialCoordinates] = useState({ x: 0, y: 0 });
	const [spectralCoordinates, setSpectralCoordinates] = useState({ x: 0, y: 0 });
	
	// x-axis - density
	// y-axis - brightness/lightness
	const handleSpatialPositionChange = async (x: number, y: number) => {
		setSpatialCoordinates({ x, y });
		console.log(`Updated position - X: ${x}, Y: ${y}`);
	};

	const handleSpatialPositionRelease = async (x: number, y: number) => {
		const activeEle = store.selectedElements[0];
		activeEle.set({lightnessEnabled: true});
		
		let image: HTMLImageElement;
		if ('lightnessImageSrc' in activeEle) {
			image = activeEle.lightnessImageSrc;
		} else {
			image = await readImage(activeEle.src);
			activeEle.set({ lightnessImageSrc: image });
		}
		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		ctx.filter = `brightness(${y}%) saturate(${x}%)`;
		setTimeout(() => {
			ctx.drawImage(image, 0, 0, image.width, image.height);
			const updatedImageSrc = canvas.toDataURL();
			activeEle.set({ src: updatedImageSrc, lightness: y });
	}, 1);
			};

	// x-axis - temperature
	// y-axis - color tint
	const handleSpectralPositionChange = async (x: number, y: number) => {
		setSpectralCoordinates({ x, y });
		console.log(`Updated spectral position - X: ${x}, Y: ${y}`);
	};

	const handleSpectralPositionRelease = async (x: number, y: number) => {
		const activeEle = store.selectedElements[0];
		activeEle.set({ colorTemperatureEnabled: true });
		let image: HTMLImageElement;
		if ('colorTemperatureImageSrc' in activeEle) {
			image = activeEle.colorTemperatureImageSrc;
		}
		else {
			image = await readImage(activeEle.src);
			activeEle.set({ colorTemperatureImageSrc: image });
		}
		const [canvas, ctx] = createCanvas(image.width, image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);
		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let src = cv.matFromImageData(imgData);
		let dst = colorTemperatureAdjustment(src, x);
		let dst2 = colorTintAdjustment(dst,y)
		setTimeout(() => {
			cv.imshow(canvas, dst2);
			src.delete();
			dst.delete();
			const outputSrc = canvas.toDataURL();
			activeEle.set({ src: outputSrc, colorTemperature: x });
			}, 1);
	}

	return (store.selectedElements.length === 1 &&
		<div className={styles.wrapper}>
			<div className={styles.cardWrapper}>
				<div className={styles.boardWrapper}>
					<SpatialBoard onPositionChange={handleSpatialPositionChange} onRelease={handleSpatialPositionRelease}></SpatialBoard>
						<SpectralBoard onPositionChange={handleSpectralPositionChange} onRelease={handleSpectralPositionRelease}></SpectralBoard>
				</div>
				<div className={styles.title}>
					{BasicOptIcon}
					<p>Basic</p>
				</div>
				
				{/*Blur*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Blur</p>
						<Switch checked={blurEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleBlurEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: blurEnabled ? 'block' : 'none' }}>
						<Slider min={0} max={20} labelStepSize={5}
								value={blurRadius}
								onChange={handleBlurRadius} />
					</div>
				</div>
				{/*Brightness*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Exposure</p>
						<Switch checked={brightnessEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleBrightnessEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: brightnessEnabled ? 'block' : 'none' }}>
						<Slider min={-1} max={1} labelStepSize={0.5} labelPrecision={1} stepSize={0.01}
								value={brightness}
								onChange={handleBrightness} />
					</div>
				</div>
				{/*Sepia*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Sepia</p>
						<Switch checked={sepiaEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleSepiaEnabled}
						/>
					</div>
				</div>
				{/*Grayscale*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Grayscale</p>
						<Switch checked={grayscaleEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleGrayscaleEnabled}
						/>
					</div>
				</div>
			</div>

			<div className={styles.cardWrapper}>
				<div className={styles.title}>
					{AdjustOptIcon}
					<p>Adjust</p>
				</div>
				{/*Contrast*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Contrast</p>
						<Switch checked={contrastEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleContrastEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: contrastEnabled ? 'block' : 'none' }}>
						<Slider min={-100} max={100} labelStepSize={50}
								value={contrast}
								onRelease={handleContrast}
								onChange={(value: number) => setContrast(value)} />
					</div>
				</div>
				{/*Lightness*/}
				{/* <div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Brightness</p>
						<Switch checked={lightnessEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleLightnessEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: lightnessEnabled ? 'block' : 'none' }}>
						<Slider min={-100} max={100} labelStepSize={50}
								value={lightness}
								onRelease={handleLightness}
								onChange={(value: number) => setLightness(value)} />
					</div>
				</div> */}
				{/*Highlight*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Highlight</p>
						<Switch checked={highlightEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleHighlightEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: highlightEnabled ? 'block' : 'none' }}>
						<Slider min={-300} max={300} labelStepSize={100} stepSize={50}
								value={highlight}
								onRelease={handleHighlight}
								onChange={(value: number) => setHighlight(value)} />
					</div>
				</div>
				{/*Sharpen*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Sharpen</p>
						<Switch checked={sharpenEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleSharpenEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: sharpenEnabled ? 'block' : 'none' }}>
						<Slider min={-0.5} max={0.5} labelStepSize={0.2} stepSize={0.1}
								value={sharpen}
								onRelease={handleSharpen}
								onChange={(value: number) => setSharpen(value)} />
					</div>
				</div>
				{/*Saturation*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Saturation</p>
						<Switch checked={saturationEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleSaturationEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: saturationEnabled ? 'block' : 'none' }}>
						<Slider min={-100} max={100} labelStepSize={50} stepSize={1}
								value={saturation}
								onRelease={handleSaturation}
								onChange={(value: number) => setSaturation(value)} />
					</div>
				</div>
				{/*ColorTemperature*/}
				<div className={styles.optionWrapper}>
					<div className={styles.labelSwitch}>
						<p>Color Temperature</p>
						<Switch checked={colorTemperatureEnabled}
								innerLabelChecked="on"
								innerLabel="off"
								onChange={handleColorTemperatureEnabled}
						/>
					</div>
					<div className={styles.optionsArea} style={{ display: colorTemperatureEnabled ? 'block' : 'none' }}>
						<Slider min={-100} max={100} labelStepSize={50} stepSize={1}
								value={colorTemperature}
								onRelease={handleColorTemperature}
								onChange={(value: number) => setColorTemperature(value)} />
					</div>
				</div>
			</div>

			{/*<div className={styles.cardWrapper}>*/}
			{/*	<div className={styles.title}>*/}
			{/*		{FiltersOptIcon}*/}
			{/*		<p>Filters</p>*/}
			{/*	</div>*/}

			{/*</div>*/}
		</div>
	);
}