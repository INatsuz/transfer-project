import {LOG_IN, LOG_OFF} from "./loginActions";

export const SAVE_NOTIFICATION_TOKEN = 'SAVE_NOTIFICATION_TOKEN';
export const DELETE_NOTIFICATION_TOKEN = 'DELETE_NOTIFICATION_TOKEN';

export const saveNotificationAction = (token) => ({
	type: SAVE_NOTIFICATION_TOKEN,
	token: token
});

export const deleteNotificationAction = () => ({
	type: DELETE_NOTIFICATION_TOKEN
});