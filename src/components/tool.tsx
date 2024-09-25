import React, { useContext } from 'react';
import SegContext from './hooks/createContext';
import { ToolProps } from './helpers/Interfaces';
import * as _ from 'underscore';

const Tool = ({ handleMouseMove }: ToolProps) => {
	const {
			  image: [image],
			  maskImg: [maskImg, setMaskImg],
		  } = useContext(SegContext)!;

	const imageClasses = '';
	const maskImageClasses = `absolute opacity-40 pointer-events-none`;

	// Render the image and the predicted mask image on top
	return (
		<>
			{ image && (
				<img
					onMouseMove={ handleMouseMove }
					onMouseOut={ () => _.defer(() => setMaskImg(null)) }
					onTouchStart={ handleMouseMove }
					src={ image.src }
					className={ imageClasses }
				></img>
			) }
			{ maskImg && (
				<img
					src={ maskImg.src }
					className={ maskImageClasses }
				></img>
			) }
		</>
	);
};

export default Tool;
