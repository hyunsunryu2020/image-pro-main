import CardContainer from '../container.tsx';
import { ToolKitCardContainerProps } from '../../types.ts';


export default function GetLUT(props: ToolKitCardContainerProps): JSX.Element {

	return <CardContainer {...props} canModifyResultAfterApi={true} />;
}