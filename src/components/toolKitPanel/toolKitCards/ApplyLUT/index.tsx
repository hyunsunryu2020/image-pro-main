// import CardContainer from '../container.tsx';
// import { ToolKitCardContainerProps } from '../../types.ts';


// export default function ApplyLUT(props: ToolKitCardContainerProps): JSX.Element {

// 	return <CardContainer {...props} canModifyResultAfterApi={true} />;
// }

import CardContainer from '../container.tsx';
import { ToolKitCardContainerProps } from '../../types.ts';
import { forwardRef } from 'react';

const ApplyLUT = forwardRef<{ clearFileInputs: () => void }, ToolKitCardContainerProps>((props, ref) => {
  return <CardContainer {...props} ref={ref} canModifyResultAfterApi={true} />;
});

export default ApplyLUT;