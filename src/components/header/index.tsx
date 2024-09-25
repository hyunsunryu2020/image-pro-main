import { useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import Image from 'next/image';
import { StoreType } from 'polotno/model/store';
import { Alert, Menu, MenuItem, Position, Intent, Popover, Tooltip } from '@blueprintjs/core';
import favicon from '../../../public/logo.png';
import styles from './header.module.css';

import FileMenu from '@/components/fileMenu';
import { AvatarIcon } from '@/components/icons';

import { signOutApi } from '@/api';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getUsername, logout } from '@/store/userSlice';
import request from '@/api/axios.ts';


export default function Header(props: { store: StoreType }): JSX.Element {
	const selector = useAppSelector;
	const userName: string = selector(getUsername);

	const dispatch = useAppDispatch();
	const router: NextRouter = useRouter();

	async function handleSignOut(): Promise<void> {
		setIsLoading(true);

		await signOutApi().then((): void => {
			router.push('/sign-in');
		}).finally((): void => {
			dispatch(logout());
			delete request.defaults.headers['Authorization'];
			localStorage.removeItem('userInfo');
			setIsLoading(false);
		});
	}

	/**----------<Alert />----------**/
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);


	return (
		<>
			<div className={styles.wrapper}>
				<div className={styles.logo}>
					<Image
						alt="favicon"
						src={favicon}
						quality={100}
						width={40}
						height={40}
					/>
				</div>

				<p className={styles.title}>S Lab Studio - Image Pro</p>

				<div className={styles.menuBar}>
					{/* save canvas */}
					<Popover
						content={<FileMenu store={props.store} />}
						placement={'bottom-start'}
					>
						<div className={styles.menuItem}>File</div>
					</Popover>

					<div className={styles.divider} />

					{/* open assets */}
					<Tooltip content="Coming soon!" position={Position.RIGHT} openOnTargetFocus={false}>
						<div className={styles.menuItem}>Assets</div>
					</Tooltip>
				</div>

				<div className={styles.right}>
					<Popover
						content={
							<Menu>
								<MenuItem icon="log-out" onClick={() => setIsOpen(true)} text="Sign Out" />
							</Menu>}
						placement={'bottom-start'}
					>
						<div className={styles.profile}>
							{AvatarIcon}
							<div className={styles.userName}>{userName}</div>
						</div>
					</Popover>
				</div>
			</div>


			<Alert
				cancelButtonText="Cancel"
				confirmButtonText="Sign Out"
				icon="log-out"
				intent={Intent.DANGER}
				isOpen={isOpen}
				loading={isLoading}
				onCancel={() => setIsOpen(false)}
				onConfirm={handleSignOut}
			>
				<p>Are you sure you want to <b>Sign Out</b>?</p>
			</Alert>
		</>
	);
}