import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import userSlice from '@/store/userSlice';


const store = configureStore({
	reducer: {
		user: userSlice, // state.user
	},
});


// 从 store 本身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>
// 推断出类型: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

const makeStore = () => store;

export const wrapper = createWrapper(makeStore);