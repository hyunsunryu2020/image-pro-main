import { useState } from 'react';
import { FormGroup, Radio, RadioGroup } from '@blueprintjs/core';


export default function MyRadio(props: any): JSX.Element {
	const [value, setValue] = useState<string>(String(props['default']));

	function updateValue(e: any): void {
		setValue(e.currentTarget.value);
		props.onChange(e.currentTarget.value);
	}


	return (
		<FormGroup label={props['title']}
				   subLabel={props.description && props.description}
		>
			<RadioGroup
				onChange={updateValue}
				selectedValue={value}
				inline={true}
			>
				{props['enum'].map((val: number) =>
					<Radio key={val} label={`x ${val}`} value={String(val)} />)}
			</RadioGroup>
		</FormGroup>
	);
}