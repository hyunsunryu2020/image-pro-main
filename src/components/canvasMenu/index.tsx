import { useState } from 'react';
import { StoreType } from 'polotno/model/store';
import { Menu, MenuItem, MenuDivider, Dialog, Icon, DialogBody, DialogFooter, Button } from '@blueprintjs/core';
import ImagePreview, { ImageFormData } from '@/components/canvasMenu/imagePreview.tsx';
import { downloadFromBase64 } from '@/common/utils/image.tsx';
import { handleFilter } from '@/common/utils/canvas.ts';


export default function CanvasMenu(props: { store: StoreType }): JSX.Element {
	const store = props.store;

	function handleDuplicate(): void {
		const axis = store.selectedElements[0];
		store.activePage.addElement({
			type: 'image',
			src: axis.src,
			x: axis.x + 50,
			y: axis.y + 50,
			width: axis.width,
			height: axis.height,
		});
	}

	function handleDelete(): void {
		const axis = store.selectedElements[0];
		store.deleteElements([axis.id]);
	}

	async function handleExportClick(quickExport: boolean, imageType?: string): Promise<void> {
		const selectedElements: Array<any> = store.selectedElements;

		if (quickExport && selectedElements.length === 1) {
			const ele = selectedElements[0];
			const src: string = await handleFilter(ele, false);
			downloadFromBase64(src, ele.name || ele.id, imageType);
		} else {
			// 生成一个 Promise 对象的数组
			const promises: Array<Promise<string>> = selectedElements.map(ele => handleFilter(ele, false));
			const tmp: { [propName: string]: ImageFormData } = {};
			Promise.all(promises).then((images: Array<string>): void => {
				for (let i = 0; i < images.length; i++) {
					const ele = selectedElements[i];
					tmp[ele.id] = {
						id: ele.id,
						fileName: ele.name || ele.id,
						imageFormat: ele.src.slice(0, 22).includes('png')
									 ? 'png'
									 : 'jpeg',
						src: images[i],
					};
				}
				setImageDataForm(tmp);
				setIsDialogOpen(true);
			});
		}
	}

	/**----------Dialog Config----------**/
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const dialogProps = {
		icon: <Icon icon={'archive'} />,
		title: <p>Download</p>,
		isOpen: isDialogOpen,

		canEscapeKeyClose: false,
		canOutsideClickClose: false,
		isCloseButtonShown: true,
	};
	const [imageDataForm, setImageDataForm] = useState<{ [propName: string]: ImageFormData }>({});

	async function handleDownload(): Promise<void> {
		for (const id in imageDataForm) {
			downloadFromBase64(imageDataForm[id].src, imageDataForm[id].fileName, imageDataForm[id].imageFormat);
		}
		setIsDialogOpen(false);
	}

	function updateImageData(data: ImageFormData): void {
		setImageDataForm(prevState => {
			return {
				...prevState,
				[data.id]: data,
			};
		});
	}


	return (
		<>
			<Menu>
				<MenuItem icon="duplicate" text="Duplicate" onClick={handleDuplicate} />
				<MenuItem icon="trash" text="Delete" onClick={handleDelete} />
				<MenuDivider />
				{store.selectedElements.length === 1 && (
					<MenuItem icon="saved" text="Quick export" intent="primary">
						<MenuItem icon="blank" text="as .jpeg" onClick={() => handleExportClick(true, 'jpeg')} />
						<MenuItem icon="blank" text="as .png" onClick={() => handleExportClick(true, 'png')} />
					</MenuItem>
				)}
				<MenuItem icon="saved" text="Export as" onClick={() => handleExportClick(false)} />
			</Menu>

			{/*Export Dialog*/}
			<Dialog {...dialogProps} onClose={() => setIsDialogOpen(false)}>
				<DialogBody>
					{isDialogOpen && imageDataForm &&
						Object.keys(imageDataForm).map((key: string) =>
							<ImagePreview key={key}
										  {...imageDataForm[key]}
										  updateImageData={updateImageData} />,
						)
					}
				</DialogBody>

				<DialogFooter actions={<Button onClick={handleDownload} text="Download" />} />
			</Dialog>
		</>
	);
}