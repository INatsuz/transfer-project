import {createStore, combineReducers} from "redux";

import loginReducer from "./reducers/loginReducer";

const rootReducer = combineReducers({login: loginReducer});

const setupStore = () => {
	return createStore(rootReducer);
};

export default setupStore;