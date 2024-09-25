import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { AIServiceOptions } from '@/common/types/AIServices';


interface UserState {
	username: string,
	token: string, // 用于获取算法服务的标志
	tools: Array<string>,
	aiServices: { panel: Array<AIServiceOptions>, toolkit: Array<AIServiceOptions> }
}

const initialState: UserState = {
	username: '',
	token: '',
	tools: [],
	aiServices: { panel: [], toolkit: [] },
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUserInfo: (state, action) => {
			state.username = action.payload.username;
			state.token = action.payload.token;
			state.tools = action.payload.tools;
		},
		logout: state => {
			state.username = '';
			state.token = '';
			state.tools = [];
		},
		setAIServices: (state, action) => {
			state.aiServices = action.payload;
		},
	},
});
export default userSlice.reducer;

// actions
export const { setUserInfo, logout, setAIServices } = userSlice.actions;

// selectors
export const getUsername = (state: RootState) => state.user.username;
export const getToken = (state: RootState) => state.user.token;
export const getTools = (state: RootState) => state.user.tools;
export const getPanelAIServices = (state: RootState) => state.user.aiServices.panel;