import styles from '@/components/sidePanel/sections/section.module.css';
import { StoreType } from 'polotno/model/store';
import { SidePanel, LayersSection, TextSection, UploadSection, PhotosSection } from 'polotno/side-panel';
import AISearchSection from '@/components/sidePanel/sections/AISearch';
import AIDrawSection from '@/components/sidePanel/sections/AIDraw';


const sections = [UploadSection, AISearchSection, AIDrawSection, PhotosSection, TextSection, LayersSection];

export default function MySidePanel(props: { store: StoreType }): JSX.Element {
	return <span className={styles.tabWrapper}>
		<SidePanel store={props.store} sections={sections} defaultSection="AISearch" />
	</span>;
};