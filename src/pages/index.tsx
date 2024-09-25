import dynamic from 'next/dynamic';
import MySpinner from '@/components/spinner';


const Editor = dynamic(() => import('@/views/editor'), {
	ssr: false,
	loading: () => <MySpinner />,
});


export default function EditingWrapper(): JSX.Element {
	return <Editor />;
}