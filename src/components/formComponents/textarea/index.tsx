import { useState } from 'react';
import { FormGroup, TextArea } from '@blueprintjs/core';


export default function MyTextArea(props: any): JSX.Element {
	const [value, setValue] = useState<string>(String(props['default']));

	function updateValue(e: any): void {
		setValue(e.currentTarget.value);
		props.onChange(e.currentTarget.value);
	}


	return (
		<FormGroup label={props['title']}
				   subLabel={props.description && props.description}
		>
			<TextArea
				fill
				placeholder="prompts"
				value={value}
				onChange={updateValue}
			/>
		</FormGroup>
	);
}