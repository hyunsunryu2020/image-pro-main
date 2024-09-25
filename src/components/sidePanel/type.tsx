export interface SectionTabProps {
	onClick: any;
	active: boolean;
}

export type TabComponent = ((props: SectionTabProps) => JSX.Element)