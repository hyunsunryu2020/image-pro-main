import CardContainer from '../container.tsx';
import { ToolKitCardContainerProps } from '../../types.ts';


export default function Deblur(props: ToolKitCardContainerProps): JSX.Element {

	return <CardContainer {...props} canModifyResultAfterApi={true} />;
}