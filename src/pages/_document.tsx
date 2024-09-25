import { Html, Head, Main, NextScript } from 'next/document';


export default function Document(): JSX.Element {
	return (
		<Html lang="en">
			<Head>
				<link rel="icon" href="/logo.png" type="image/x-icon" />
			</Head>
			<body className="bp5-dark">
			<Main />
			<NextScript />
			</body>
		</Html>
	);
}