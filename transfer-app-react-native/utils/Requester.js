import axios from 'axios';
import store from "../redux/setupStore";
import {navigationRef} from "./RootNavigation";
import {logoffAction} from "../redux/actions/loginActions";
import {deleteTokens, getTokens, saveTokens} from "./TokenManager";

export const IP = "81.84.159.96:3000";

export async function refreshTokens(refreshToken) {
	console.log("Refreshing token (Requester util)");
	return new Promise(function (resolve, reject) {
		axios.get(`http://${IP}/users/renew?refreshToken=${refreshToken}`).then(res => {
			saveTokens({accessToken: res.data.accessToken, refreshToken: res.data.refreshToken}).then(() => {
				resolve({newAccessToken: res.data.accessToken, newRefreshToken: res.data.refreshToken});
			}).catch(err => {
				console.log(err);
				reject(err);
			});
		}).catch(err => {
			reject(err);
		});
	});
}

export async function logOff() {
	console.log("Logging you off (Requester)");
	deleteTokens().then(() => {
		store.dispatch(logoffAction());
		navigationRef.reset({
			index: 0,
			routes: [{name: "Login"}]
		});
	});
}

export function getWithAuth(endpoint) {
	return new Promise(function (resolve, reject) {
		getTokens().then(({accessToken, refreshToken}) => {
			axios.get(`http://${IP}/${endpoint}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then(res => {
				if (res.status === 200) {
					resolve(res);
				}
			}).catch(err => {
				if (err.response.status === 401) {
					refreshTokens(refreshToken).then(({newAccessToken}) => {
						axios.get(`http://${IP}/${endpoint}`, {
							headers: {
								Authorization: `Bearer ${newAccessToken}`
							}
						}).then(res => {
							if (res.status === 200) {
								resolve(res);
							}
						});
					}).catch(err => {
						logOff().then(r => reject(err));
					});
				} else {
					console.log(err);
					reject(err);
				}
			});
		});
	});
}

export function postWithAuth(endpoint, data) {
	return new Promise(function (resolve, reject) {
		getTokens().then(({accessToken, refreshToken}) => {
			axios.post(`http://${IP}/${endpoint}`, data, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then(res => {
				if (res.status === 200) {
					resolve(res);
				}
			}).catch(err => {
				if (err.response.status === 401) {
					refreshTokens(refreshToken).then(({newAccessToken, newRefreshToken}) => {
						axios.post(`http://${IP}/${endpoint}`, data, {
							headers: {
								Authorization: `Bearer ${newAccessToken}`
							}
						}).then(res => {
							if (res.status === 200) {
								resolve(res);
							}
						});
					}).catch(err => {
						logOff().then(r => reject(err));
					});
				} else {
					console.log(err);
					reject(err);
				}
			});
		});
	});
}

export function putWithAuth(endpoint, data) {
	return new Promise(function (resolve, reject) {
		getTokens().then(({accessToken, refreshToken}) => {
			axios.put(`http://${IP}/${endpoint}`, data, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then(res => {
				if (res.status === 200) {
					resolve(res);
				}
			}).catch(err => {
				if (err.response.status === 401) {
					refreshTokens(refreshToken).then(({newAccessToken, newRefreshToken}) => {
						axios.put(`http://${IP}/${endpoint}`, data, {
							headers: {
								Authorization: `Bearer ${newAccessToken}`
							}
						}).then(res => {
							if (res.status === 200) {
								resolve(res);
							}
						});
					}).catch(err => {
						logOff().then(r => reject(err));
					});
				} else {
					console.log(err);
					reject(err);
				}
			});
		});
	});
}

export function deleteWithAuth(endpoint) {
	return new Promise(function (resolve, reject) {
		getTokens().then(({accessToken, refreshToken}) => {
			axios.delete(`http://${IP}/${endpoint}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then(res => {
				if (res.status === 200) {
					resolve(res);
				}
			}).catch(err => {
				if (err.response.status === 401) {
					refreshTokens(refreshToken).then(({newAccessToken, newRefreshToken}) => {
						axios.delete(`http://${IP}/${endpoint}`, {
							headers: {
								Authorization: `Bearer ${newAccessToken}`
							}
						}).then(res => {
							resolve(res);
						});
					}).catch(err => {
						store.dispatch(logoffAction());
						reject(err);
					});
				} else {
					console.log(err);
					reject(err);
				}
			});
		});
	});
}