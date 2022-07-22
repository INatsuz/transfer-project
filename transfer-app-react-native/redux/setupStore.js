import {createStore, combineReducers} from "redux";

import loginReducer from "./reducers/loginReducer";

const rootReducer = combineReducers({login: loginReducer});

const setupStore = () => {
	return createStore(rootReducer);
};

const store = setupStore();

export default store;