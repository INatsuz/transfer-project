import * as SecureStore from "expo-secure-store";

export async function getTokens() {
	return new Promise(function (resolve, reject) {
		SecureStore.getItemAsync("accessToken").then(accessToken => {
			SecureStore.getItemAsync("refreshToken").then(async refreshToken => {
				if (accessToken && refreshToken) {
					resolve({accessToken: accessToken, refreshToken: refreshToken});
				} else {
					await deleteTokens();
					reject("One is null");
				}
			}).catch(async err => {
				await deleteTokens();
				reject(err);
			});
		}).catch(async err => {
			await deleteTokens();
			reject(err);
		});
	});
}

export async function saveTokens(tokens) {
	let {accessToken, refreshToken} = tokens;

	console.log("Saving tokens...");
	console.log(accessToken);
	console.log(refreshToken);
	await SecureStore.setItemAsync("accessToken", accessToken);
	await SecureStore.setItemAsync("refreshToken", refreshToken);
}

export async function deleteTokens() {
	console.log("Deleting tokens...");
	await SecureStore.deleteItemAsync("accessToken");
	await SecureStore.deleteItemAsync("refreshToken");
}