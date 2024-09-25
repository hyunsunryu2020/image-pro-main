import CardContainer from '../container.tsx';
import { ToolKitCardContainerProps } from '../../types.ts';


export default function Segment(props: ToolKitCardContainerProps): JSX.Element {

	return <CardContainer {...props} />;
}