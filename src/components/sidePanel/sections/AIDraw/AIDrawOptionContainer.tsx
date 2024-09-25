import { useEffect, useState } from 'react';
import { Tooltip } from '@blueprintjs/core';
import styles from './aiDraw.module.css';
import { ArrowDown, InfoIcon } from '@/components/icons';
import { AIDrawModelOptions } from '@/components/sidePanel/sections/AIDraw/panel.tsx';


export default function AIDrawOptionContainer(props: AIDrawModelOptions): JSX.Element {
	const [isOpen, setIsOpen] = useState<boolean>(props.isShow);

	return (
		<div className={styles.cardWrapper}>
			{/* Card Header */}
			<div className={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
				<div style={{
					marginRight: '8px',
					rotate: !isOpen ? '270deg' : 'none',
				}}>
					{ArrowDown}
				</div>

				{props.icon}

				<p>{props.title}</p>

				{isOpen && props.toolTip && <div className={styles.cardInfoIcon}>
					<Tooltip content={<p className={styles.toolTipWrapper}>{props.toolTip}</p>}>
						{InfoIcon}
					</Tooltip>
				</div>}
			</div>

			{/* Card Input */}
			<div className={styles.cardInput}
				 style={{
					 display: !isOpen && 'none',
				 }}
			>
				{props.cardInput}
			</div>
		</div>
	);
}