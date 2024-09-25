import '@/styles/globals.css';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import type { AppProps } from 'next/app';
import { NextRouter, useRouter } from 'next/router';
import Head from 'next/head';
import { FocusStyleManager } from '@blueprintjs/core';
import { wrapper } from '@/store/store';
import { useAppDispatch } from '@/store/hooks';
import { setUserInfo } from '@/store/userSlice';
import request from '@/api/axios.ts';


function App({ Component, pageProps }: AppProps) {
	FocusStyleManager.onlyShowFocusOnTabs(); // disable focus style on Tabs component

	/* Redux */
	const { store, props } = wrapper.useWrappedStore(pageProps);
	const dispatch = useAppDispatch();

	/* check session status */
	const retrieved = useRef(false); // To get around strict mode running the hook twice
	const router: NextRouter = useRouter();

	// execute the hook once while rendering
	useEffect((): void => {
		if (retrieved.current) return;
		retrieved.current = true;

		const info: string | null = localStorage.getItem('userInfo');
		if (info !== null) {
			dispatch(setUserInfo(JSON.parse(info)));
			request.defaults.headers['Authorization'] = `bearer ${JSON.parse(info).token}`;
		} else {
			router.push('/sign-in');
		}
	}, []);


	return (
		<Provider store={store}>
			<Head>
				<title>S Lab Studio - Image Pro</title>
			</Head>
			<Component {...props} />
		</Provider>
	);
}

export default wrapper.withRedux(App);