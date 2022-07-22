export const LOG_IN = 'LOG_IN';
export const LOG_OFF = 'LOG_OFF';

export const loginAction = (user) => ({
	type: LOG_IN,
	email: user.email,
	name: user.name,
	userType: user.userType,
	activeVehicle: user.activeVehicle
});

export const logoffAction = () => ({
	type: LOG_OFF
});