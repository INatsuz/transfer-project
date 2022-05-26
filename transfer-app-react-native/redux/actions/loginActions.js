export const LOG_IN = 'LOG_IN';
export const LOG_OFF = 'LOG_OFF';

export const loginAction = (tokens) => ({
	type: LOG_IN
});

export const logoffAction = () => ({
	type: LOG_OFF
});