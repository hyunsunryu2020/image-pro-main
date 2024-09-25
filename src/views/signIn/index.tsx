import styles from './signIn.module.css';
import { FormEvent, KeyboardEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import bg from '../../../public/background.jpeg';
import { Button, FormGroup, InputGroup, Intent, OverlayToaster, Position, Tooltip } from '@blueprintjs/core';
import MySpinner from '@/components/spinner';
import { GrGoogleIcon } from '@/components/icons';
import { useAppDispatch } from '@/store/hooks';
import { setUserInfo } from '@/store/userSlice';
import { signInApi } from '@/api';
import request from '@/api/axios.ts';
import { AxiosResponse } from 'axios';
import { UserSignInData } from '@/api/session.ts';


export default function SignIn(): JSX.Element {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// Username & Password
	const [username, setUsername] = useState<string>('');
	const [usernameHelpText, setUsernameHelpText] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [pwdHelpText, setPwdHelpText] = useState<string>('');

	function validate(): boolean {
		if (username && password) {
			setUsernameHelpText('');
			setPwdHelpText('');
			return true;
		}
		if (!username) {
			setUsernameHelpText('Please input correct USERNAME.');
		}
		if (!password) {
			setPwdHelpText('Please input correct PASSWORD.');
		}
		return false;
	}

	const dispatch = useAppDispatch();
	const router = useRouter();

	async function handleConfirm(): Promise<void> {
		if (validate()) {
			setIsLoading(true);
			await signInApi({ username, password }).then((res: AxiosResponse<UserSignInData, any>) => {
				dispatch(setUserInfo(res.data));
				request.defaults.headers['Authorization'] = `bearer ${res.data.token}`;
				localStorage.setItem('userInfo', JSON.stringify(res.data));
				router.push('/');
			}).catch(() => {
				OverlayToaster.create({ position: Position.TOP })
					.show({
						message: <p>ERROR: Incorrect username or password.</p>,
						intent: Intent.DANGER,
					});
				setIsLoading(false);
			});
		}
	}

	async function watchKeyDown(e: KeyboardEvent): Promise<void> {
		e.key === 'Enter' && await handleConfirm();
	}

	function watchChange(e: FormEvent<HTMLElement>): void {
		const target: HTMLInputElement = e.target as HTMLInputElement;
		if (target.id === 'username') {
			setUsername(target.value);
		} else {
			setPassword(target.value);
		}
	}

	// InputIcon
	const usernameButton: JSX.Element = (
		<Button
			icon="user"
			minimal={true}
			tabIndex={-1}
		/>
	);

	const [showPassword, setShowPassword] = useState<boolean>(false);

	function handleLockClick(): void {
		setShowPassword(!showPassword);
	}

	const lockButton: JSX.Element = (
		<Tooltip content={`${showPassword ? 'Hide' : 'Show'} Password`}>
			<Button
				icon={showPassword ? 'unlock' : 'lock'}
				minimal={true}
				tabIndex={-1}
				onClick={handleLockClick}
			/>
		</Tooltip>
	);


	return (
		<div className={styles.wrapper}>
			<Image
				className={styles.bg}
				alt="bg"
				src={bg}
				quality={100}
				fill
				sizes="100vw"
			/>
			{isLoading
			 ? <MySpinner />
			 : <section className={styles.dialog}>
				 <p className={styles.title}>Sign in</p>

				 <p className={styles.text}>Get started with Google account on Image Pro.</p>

				 <Button className={styles.GoogleBtn} icon={GrGoogleIcon}>Sign in with Google</Button>

				 <div className={styles.divider}>
					 <div></div>
					 <p>or</p>
					 <div></div>
				 </div>

				 <FormGroup className={styles.textInput}
							helperText={usernameHelpText.length > 0 ? usernameHelpText : ''}
				 >
					 <InputGroup id="username" placeholder="Username" asyncControl
								 rightElement={usernameButton}
								 onChange={watchChange}
								 onKeyDown={watchKeyDown}
								 value={username} />
				 </FormGroup>
				 <FormGroup className={styles.textInput}
							helperText={pwdHelpText.length > 0 ? pwdHelpText : ''}
				 >
					 <InputGroup id="password" placeholder="Password" asyncControl
								 type={showPassword ? 'text' : 'password'}
								 rightElement={lockButton}
								 onChange={watchChange}
								 onKeyDown={watchKeyDown}
								 value={password} />
				 </FormGroup>

				 <Button className={styles.confirmBtn} onClick={handleConfirm}>Confirm</Button>
			 </section>
			}
		</div>
	);
}