import { useState } from 'react';
import { FormGroup, Switch } from '@blueprintjs/core';
import styles from './switch.module.css';


export default function MySwitch(props: any): JSX.Element {
	const [value, setValue] = useState<boolean>(props['default']);

	function updateValue(e: any): void {
		setValue(e.target.checked);
		props.onChange(e.target.checked);
	}


	return (
		<>
			<FormGroup label={props['title']}
					   inline={true}
			>
				<Switch
					onChange={updateValue}
					checked={value}
					innerLabelChecked="on"
					innerLabel="off" />
			</FormGroup>
			<p className={styles.helperText}>{props.description && props.description}</p>
		</>
	);
}