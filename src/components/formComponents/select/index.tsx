import { useState } from 'react';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { Button, FormGroup, MenuItem } from '@blueprintjs/core';


interface ItemState {
	value: number;
}

export default function MySelect(props: any): JSX.Element {
	const [value, setValue] = useState<number>(props['default']);

	function updateValue(item: ItemState): void {
		setValue(item.value);
		props.onChange(item.value);
	}

	const renderSelectItem: ItemRenderer<ItemState> = (item: ItemState) => (
		<MenuItem
			key={item.value}
			onClick={() => updateValue(item)}
			roleStructure="listoption"
			text={`${item.value}`}
		/>
	);

	const ItemList: Array<ItemState> = props['enum'].map((val: number) => {
		return { value: val };
	});


	return (
		<FormGroup label={props['title']}
				   subLabel={props.description && props.description}
		>
			<Select<ItemState>
				itemRenderer={renderSelectItem}
				items={ItemList}
				onItemSelect={updateValue}
				filterable={false}
			>
				<Button text={value} rightIcon="double-caret-vertical" />
			</Select>
		</FormGroup>
	);
}