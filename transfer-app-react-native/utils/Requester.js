import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import {store} from "../App";
import {logoffAction} from "../redux/actions/loginActions";

const IP = "81.84.159.96:3000";

async function getTokens() {
	let accessToken = await SecureStore.getItemAsync("accessToken");
	let refreshToken = await SecureStore.getItemAsync("refreshToken");

	if (accessToken && refreshToken) {
		return {accessToken: accessToken, refreshToken: refreshToken};
	} else {
		return false;
	}
}

async function saveTokens(tokens) {
	let {accessToken, refreshToken} = tokens;

	console.log("Saving tokens...");
	console.log(accessToken);
	console.log(refreshToken);
	await SecureStore.setItemAsync("accessToken", accessToken);
	await SecureStore.setItemAsync("refreshToken", refreshToken);
}

async function refreshTokens(refreshToken) {
	return new Promise(function (resolve, reject) {
		axios.get(`http://${IP}/users/renew?refreshToken=${refreshToken}`).then(res => {
			saveTokens({accessToken: res.data.accessToken, refreshToken: res.data.refreshToken}).then(res => {
				resolve({newAccessToken: res.data.accessToken, newRefreshToken: res.data.refreshToken});
			});
		}).catch(err => {
			reject(err);
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
					refreshTokens(refreshToken).then(({newAccessToken, newRefreshToken}) => {
						axios.get(`http://${IP}/${endpoint}`, {
							headers: {
								Authorization: `Bearer ${newAccessToken}`
							}
						}).then(res => {
							saveTokens({accessToken: newAccessToken, refreshToken: newRefreshToken}).then(res => {
								getWithAuth(endpoint).then(res => resolve(res));
							}).catch(err => {
								reject(err);
							});;
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
						axios.get(`http://${IP}/${endpoint}`, {
							headers: {
								Authorization: `Bearer ${newAccessToken}`
							}
						}).then(res => {
							saveTokens({accessToken: newAccessToken, refreshToken: newRefreshToken}).then(res => {
								postWithAuth(endpoint, data).then(res => resolve(res));
							}).catch(err => {
								reject(err);
							});
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