import CardContainer from '../container.tsx';
import { ToolKitCardContainerProps } from '../../types.ts';


export default function Colorization(props: ToolKitCardContainerProps): JSX.Element {

	return <CardContainer {...props} canModifyResultAfterApi={false} />;
}