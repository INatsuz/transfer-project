import {SAVE_NOTIFICATION_TOKEN} from "../actions/notificationActions";
import {DELETE_NOTIFICATION_TOKEN} from "../actions/notificationActions";

const initialState = {
	token: null
};

const notificationReducer = (state= initialState, action) => {
	switch (action.type) {
		case SAVE_NOTIFICATION_TOKEN:
			return {...state, token: action.token};
		case DELETE_NOTIFICATION_TOKEN:
			return {...state, token: null};
		default:
			return state;
	}
};

export default notificationReducer;