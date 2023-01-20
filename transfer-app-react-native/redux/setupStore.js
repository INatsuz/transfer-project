import {createStore, combineReducers} from "redux";

import loginReducer from "./reducers/loginReducer";
import notificationReducer from "./reducers/notificationReducer";

const rootReducer = combineReducers({login: loginReducer, notification: notificationReducer});

const setupStore = () => {
	return createStore(rootReducer);
};

const store = setupStore();

export default store;