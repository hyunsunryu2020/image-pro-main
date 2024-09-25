import { useState } from 'react';
import { FormGroup, Slider } from '@blueprintjs/core';


export default function MySlider(props: any): JSX.Element {
	const [value, setValue] = useState<number>(props['default']);

	function updateValue(e: number): void {
		setValue(e);
		props.onChange(e);
	}


	return (
		<FormGroup label={props['title']}
				   subLabel={props.description && props.description}
				   inline={props.inline}
		>
			<Slider
				min={props['minimum']}
				max={props['maximum']}
				stepSize={props['multipleOf']}
				labelStepSize={props['maximum']}
				onChange={updateValue}
				value={value}
				disabled={props['disabled']}
			/>
		</FormGroup>
	);
}