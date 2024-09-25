import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ImagesGrid } from 'polotno/side-panel';
import { getImageSize } from 'polotno/utils/image';
import { StoreType } from 'polotno/model/store';
import { Button, InputGroup, Tab, TabId, Tabs } from '@blueprintjs/core';
import styles from './aiSearch.module.css';
import { AISearchIcon, EmptyIcon } from '@/components/icons';
import { AISearchApi } from '@/api';
import { AISearchParams } from '@/api/ai.ts';
import { AxiosResponse } from 'axios';


export default function AISearchPanel(props: { store: StoreType }): JSX.Element {
	// render images list source
	const [images, setImages] = useState<Array<string>>([]);
	// indicate the status of the Api calling process
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedTabId, setSelectedTabId] = useState<TabId>('');
	// save the query text
	const [queryStr, setQueryStr] = useState<string>('');
	const [canSearchMore, setCanSearchMore] = useState<boolean>(true);

	/** init <AISearchPanel /> **/
	useEffect((): void => {
		const curTabId: string = sessionStorage.getItem('AISearchTabId') || 'str';
		const queryStr: string = sessionStorage.getItem('AISearchQueryStr') || '';

		handleTabClick(curTabId);

		curTabId === 'str' && queryStr && searchByText(queryStr);
	}, []);

	async function fetchImages(params: AISearchParams, callbackFn?: Function): Promise<void> {
		setIsLoading(true);
		setImages([]);

		await AISearchApi(params).then((res: AxiosResponse<Array<string>, any>): void => {
			res.data.length && setImages(res.data.map((url: string): string =>
				process.env.NEXT_PUBLIC_ENV === 'development'
				? url.replace(process.env.NEXT_PUBLIC_FE_HOST, process.env.NEXT_PUBLIC_BE_HOST)
				: url));

			callbackFn && callbackFn();

			setIsLoading(false);
		});
	}

	// only support 'search by text'
	async function loadMoreImages(): Promise<void> {
		setCanSearchMore(false);
		// more_results?: boolean; false (or not set) return first 50 results, true return 100 results.
		await AISearchApi({
			query_string: queryStr,
			more_results: true,
		}).then((res: AxiosResponse<Array<string>, any>): void => {
			res.data.length > 50 && setImages(res.data.map((url: string): string =>
				process.env.NEXT_PUBLIC_ENV === 'development'
				? url.replace(process.env.NEXT_PUBLIC_FE_HOST, process.env.NEXT_PUBLIC_BE_HOST)
				: url));
		});
	}

	async function handleImageSelect(image: string, pos?: { x: number; y: number; }): Promise<void> {
		const { width, height } = await getImageSize(image);
		props.store.activePage.addElement({
			type: 'image',
			src: image,
			width,
			height,
			x: pos?.x || 0,
			y: pos?.y || 0,
		});
	}

	function handleTabClick(id: TabId): void {
		sessionStorage.setItem('AISearchTabId', id as string);
		setSelectedTabId(id);
	}

	/* Search by Text */
	async function searchByText(str: string): Promise<void> {
		setQueryStr(str);

		if (str) {
			await fetchImages({ query_string: str }, () => setCanSearchMore(true));
		} else {
			setImages([]);
		}
	}

	function watchInputChange(e: ChangeEvent): void {
		const target: HTMLInputElement = e.target as HTMLInputElement;
		setQueryStr(target.value);
	}

	async function watchInputKeyDown(e: KeyboardEvent): Promise<void> {
		const target: HTMLInputElement = e.target as HTMLInputElement;
		if (e.key === 'Enter' && target.value) {
			await searchByText(target.value);
		}
	}

	/* Search by Image */
	const inputImageRef = useRef(null);

	function handleImportClick(): void {
		inputImageRef && inputImageRef.current && inputImageRef.current.click();
	}

	async function handleImport(e: ChangeEvent<HTMLInputElement>): Promise<void> {
		const image: File = e.target.files[0] as File;

		const formData: FormData = new FormData();
		formData.append('image', image);

		await fetchImages(formData, (): void => {
			inputImageRef.current.value = null;
		});
	}


	return (
		<div className={styles.wrapper}>
			<div className={styles.title}>
				{AISearchIcon}
				<p>AI Search</p>
			</div>

			<Tabs className={styles.tabs}
				  onChange={handleTabClick}
				  selectedTabId={selectedTabId}
			>
				<Tab id="str" title="Search by Text" icon={'search-text'}
					 panel={<InputGroup
						 leftIcon="search"
						 placeholder="Search..."
						 value={queryStr}
						 onChange={watchInputChange}
						 onKeyDown={watchInputKeyDown}
					 />}
				/>
				<Tab id="image" title="Search by Image" icon={'camera'}
					 panel={<>
						 <Button text={'Import Image'} fill onClick={handleImportClick} icon={'export'} />
						 <input
							 hidden
							 type="file"
							 ref={inputImageRef}
							 accept="image/*"
							 onChange={handleImport}
						 />
					 </>}
				/>
			</Tabs>


			{!isLoading && images.length === 0
			 ? <div className={styles.emptyWrapper}>
				 <div className={styles.emptyContent}>
					 {EmptyIcon}
					 <p>No Images</p>
				 </div>
			 </div>
			 : < ImagesGrid
				 images={images}
				 getPreview={(image) => image}
				 onSelect={handleImageSelect}
				 rowsNumber={2}
				 isLoading={isLoading}
				 loadMore={selectedTabId === 'str' && canSearchMore ? loadMoreImages : false}
			 />}
		</div>
	);
}