import { StoreType } from 'polotno/model/store';
import { Menu, MenuItem } from '@blueprintjs/core';
import { int } from '@/common/utils/tools';


export default function FileMenu(props: { store: StoreType }): JSX.Element {
	function handleCanvasExport(): void {
		props.store.saveAsImage({
			fileName: `image-pro-${int(Date.now() / 1000)}`,
			mimeType: 'image/png',
			ignoreBackground: true,
			includeBleed: false,
		});
	}


	return (
		<Menu>
			<MenuItem icon="import" onClick={handleCanvasExport} text="Export canvas" />
		</Menu>
	);
};