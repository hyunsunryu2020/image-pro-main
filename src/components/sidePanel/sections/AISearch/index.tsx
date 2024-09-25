import { SectionTab } from 'polotno/side-panel';
import { AISearchIcon } from '@/components/icons';
import { SectionTabProps, TabComponent } from '@/components/sidePanel/type.tsx';
import AISearchPanel from './panel.tsx';


const MyTabComponent: TabComponent = (props: SectionTabProps) => (
	<SectionTab name="AI Search" {...props}>
		{AISearchIcon}
	</SectionTab>
);

const MyTab = MyTabComponent as TabComponent & {
	displayName: string
};
MyTab.displayName = 'AI Search';

const AISearchSection = {
	name: 'AISearch',
	Tab: MyTab,
	Panel: AISearchPanel,
};

export default AISearchSection;