import * as SecureStore from "expo-secure-store";

export async function getTokens() {
	return new Promise(async (resolve, reject) => {
		let accessToken = await SecureStore.getItemAsync("accessToken");
		let refreshToken = await SecureStore.getItemAsync("refreshToken");

		if (accessToken && refreshToken) {
			resolve({accessToken: accessToken, refreshToken: refreshToken});
		} else {
			reject();
		}
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