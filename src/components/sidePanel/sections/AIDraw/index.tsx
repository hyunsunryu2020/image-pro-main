import { SectionTab } from 'polotno/side-panel';
import { AIDrawIcon } from '@/components/icons';
import { SectionTabProps, TabComponent } from '@/components/sidePanel/type.tsx';
import AIDrawPanel from './panel.tsx';


const MyTabComponent: TabComponent = (props: SectionTabProps) => (
	<SectionTab name="AI Draw" {...props}>
		{AIDrawIcon}
	</SectionTab>
);

const MyTab = MyTabComponent as TabComponent & {
	displayName: string
};
MyTab.displayName = 'AI Draw';

const AIDrawSection = {
	name: 'AIDraw',
	Tab: MyTab,
	Panel: AIDrawPanel,
};

export default AIDrawSection;