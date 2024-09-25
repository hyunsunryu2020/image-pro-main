import { ChangeEvent } from 'react';
import Image from 'next/image';
import { FormGroup, InputGroup, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import styles from './imagePreview.module.css';


export interface ImageFormData {
	id: string
	fileName: string,
	imageFormat: string,
	src: string
}

type ImagePreviewProps = ImageFormData & { updateImageData: Function }

interface Suffix {
	type: string,
	rank: number
}

const ImageSuffix: Array<Suffix> = [
	{ type: 'jpeg', rank: 1 },
	{ type: 'png', rank: 2 },
];

export default function ImagePreview(props: ImagePreviewProps): JSX.Element {
	const renderSuffix: ItemRenderer<Suffix> = (suffix: Suffix) => (
		<MenuItem
			key={suffix.rank}
			label={suffix.type}
			onClick={() => handleImageFormatChange(suffix)}
			roleStructure="listoption"
			text={suffix.type}
		/>
	);

	function handleFileNameChange(e: ChangeEvent<HTMLInputElement>): void {
		props.updateImageData({
			id: props.id,
			fileName: e.target.value,
			imageFormat: props.imageFormat,
			src: props.src,
		});
	}

	function handleImageFormatChange(item: Suffix): void {
		props.updateImageData({
			id: props.id,
			fileName: props.fileName,
			imageFormat: item.type,
			src: props.src,
		});
	}


	return (
		<div className={`${styles.imagePreviewWrapper} ${styles.flexRC}`}>
			<Image
				alt="image"
				src={props.src}
				quality={100}
				width={100}
				height={100}
				style={{ objectFit: 'scale-down' }}
			/>

			<div style={{ marginLeft: '10px' }}>
				<FormGroup label="File Name"
						   inline={true}
				>
					<div className={styles.flexRC}>
						<InputGroup placeholder="please input file name" value={props.fileName}
									onChange={handleFileNameChange} />

						<span style={{ marginRight: '10px', marginLeft: '10px' }}>.</span>

						<div style={{ width: '60px' }}>
							<Select<Suffix> items={ImageSuffix}
											itemRenderer={renderSuffix}
											onItemSelect={handleImageFormatChange}
											filterable={false}
							>
								<InputGroup value={props.imageFormat} />
							</Select>
						</div>
					</div>
				</FormGroup>
			</div>
		</div>
	);
}