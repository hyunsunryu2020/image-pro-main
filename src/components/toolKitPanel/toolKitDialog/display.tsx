/**
 * The function of this component is to display the original image.
 */
import styles from './toolKitDialog.module.css';
import { useEffect, useRef } from 'react';

interface DisplayProps {
	image: HTMLImageElement;
	width: number;
	height: number;
}

export default function DefaultDisplay(props: DisplayProps): JSX.Element {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		canvas.width = props.width;
		canvas.height = props.height;
		const ctx = canvas.getContext('2d');

		ctx.drawImage(props.image, 0, 0, props.width, props.height);
	}, [props.image, props.width, props.height]);


	return <canvas ref={canvasRef} className={styles.wrapper}></canvas>;
}