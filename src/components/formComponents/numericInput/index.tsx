import { useState } from 'react';
import { FormGroup, NumericInput } from '@blueprintjs/core';
import styles from './numericInput.module.css';


export default function MyNumericInput(props: any): JSX.Element {
	const [value, setValue] = useState<number>(Number(props['default']));

	function updateValue(e: number): void {
		setValue(e);
		props.onChange(e);
	}

	const settings = {
		min: props.minimum,
		max: props.maximum,
	};


	return (
		<FormGroup label={props['title']}
				   subLabel={props.description && props.description}
				   className={styles.formItem}
		>
			<NumericInput {...settings} className={styles.inputItem}
						  value={value}
						  onValueChange={updateValue} />
		</FormGroup>
	);
}