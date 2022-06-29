import {LOG_IN} from "../actions/loginActions";
import {LOG_OFF} from "../actions/loginActions";

const initialState = {
	loggedIn: false,
	email: "",
	name: "",
	userType: -1
};

const loginReducer = (state= initialState, action) => {
	switch (action.type) {
		case LOG_IN:
			return {...state, loggedIn: true, email: action.email, name: action.name, userType: action.userType};
		case LOG_OFF:
			return {...state, loggedIn: false};
		default:
			return state;
	}
};

export default loginReducer;