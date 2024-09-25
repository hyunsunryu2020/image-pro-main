import styles from './spinner.module.css';
import { Spinner } from '@blueprintjs/core';
import { Colors } from '@blueprintjs/core';


export default function MySpinner(): JSX.Element {
	return <Spinner className={styles.spinner} style={{ color: Colors.VIOLET1 }} />;
}