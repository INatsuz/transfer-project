import {
	Button,
	Dimensions,
	ImageBackground,
	KeyboardAvoidingView,
	NativeModules,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
	ActivityIndicator
} from "react-native";
import Banner from './Banner';
import useEmailField from "../../hooks/useEmailField";
import {useDispatch, useSelector} from "react-redux";
import {loginAction} from "../../redux/actions/loginActions";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import {useEffect, useState} from "react";

// import {StackActions, CommonActions} from "@react-navigation/native";

async function saveTokens(tokens) {
	let {accessToken, refreshToken} = tokens;

	console.log("Saving tokens...");
	console.log(accessToken);
	console.log(refreshToken);
	await SecureStore.setItemAsync("accessToken", accessToken);
	await SecureStore.setItemAsync("refreshToken", refreshToken);
}

async function deleteTokens() {
	console.log("Deleting tokens...");
	await SecureStore.deleteItemAsync("accessToken");
}

async function getAccessToken() {
	let token = await SecureStore.getItemAsync("accessToken");

	if (token) {
		return token;
	} else {
		return false;
	}
}

async function getRefreshToken() {
	let token = await SecureStore.getItemAsync("refreshToken");

	if (token) {
		return token;
	} else {
		return false;
	}
}

async function getTokens() {
	let accessToken = await SecureStore.getItemAsync("accessToken");
	let refreshToken = await SecureStore.getItemAsync("refreshToken");

	if (accessToken && refreshToken) {
		return {accessToken: accessToken, refreshToken: refreshToken};
	} else {
		return false;
	}
}

export default function Login(props) {
	const [isLoading, setIsLoading] = useState(true);
	const {email, setEmail, isValidStyling} = useEmailField();
	const isLoggedIn = useSelector(state => state.login.loggedIn);
	const dispatch = useDispatch();

	useEffect(() => {
		if (isLoggedIn) {
			// props.navigation.navigate("Main Tab Navigator");
		}
	}, [isLoggedIn])

	//Checking if logged in on startup
	useEffect(() => {
		// deleteTokens({accessToken: undefined, refreshToken: undefined});
		// saveTokens({
		// 	accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MSwiZW1haWwiOiJ2YXNjb3JhbWluaG9zQGhvdG1haWwuY29tIiwiaWF0IjoxNjUzMzQwMzEzLCJleHAiOjE2NTMzNDM5MTN9.FCmGayFaGMdJ8y4gnxhHibe8aIaU-kNxYvFFyLsorCg",
		// 	refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MSwiZW1haWwiOiJ2YXNjb3JhbWluaG9zQGhvdG1haWwuY29tIiwiaWF0IjoxNjUzMzQwMzEzLCJleHAiOjE2NTM1MTMxMTN9.6_mWLFsHlxbNpYit2gE8lpmcTk6EqF1y1AyC7gJudNY"})
		getTokens().then(({accessToken, refreshToken}) => {
			if (accessToken || refreshToken) {
				axios.get(`http://88.193.161.41:3000/users/checkLogin?token=${accessToken}`).then(res => {
					console.log("Verified the access token");
					console.log(res.data.loggedIn);

					if (res.data.loggedIn === true) {
						dispatch(loginAction());
						setIsLoading(false);
					}
				}).catch(err => {
					console.log(JSON.stringify(err));
					console.log(err.response);
					console.log(err.response.data);

					if (refreshToken) {
						axios.get(`http://88.193.161.41:3000/users/renew?refreshToken=${refreshToken}&email=vascoraminhos@hotmail.com`).then(res => {
							console.log("Refreshing the token");
							console.log(res.data.accessToken);
							console.log(res.data.refreshToken);

							if (res.data.accessToken && res.data.refreshToken) {
								saveTokens({accessToken: res.data.accessToken, refreshToken: res.data.refreshToken});
								dispatch(loginAction());
								setIsLoading(false);
							}
						}).catch(err => {
							console.log(JSON.stringify(err));
							console.log(err.response);
							console.log(err.response.data);
							setIsLoading(false);
							deleteTokens();
						});
					} else {
						setIsLoading(false);
					}
				});
			} else {
				setIsLoading(false);
			}
		}).catch(err => {
			console.log(err);
		})
	}, []);

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
			<ImageBackground source={require("../../assets/login_bg_2.png")} style={styles.background_image}>
			</ImageBackground>
			{isLoading ? (
				<View style={[styles.container, {justifyContent: "center", alignItems: "center", height: "100%"}]}>
					<ActivityIndicator size={"large"}/>
				</View>
			) : (
				<ScrollView style={styles.container}>
					<View style={styles.content_container}>
						<Banner/>
						<View style={styles.inputs_container}>
							<TextInput style={[styles.input, isValidStyling()]} placeholder="Email" placeholderTextColor="#A3A9AA" onEndEditing={e => {
								setEmail(e.nativeEvent.text);
							}}/>
							<TextInput secureTextEntry={true} style={styles.input} placeholder={isLoggedIn.toString()} placeholderTextColor="#A3A9AA"/>
							<View style={{width: "100%"}}>
								<Button title={"Login"} onPress={e => {
									props.navigation.reset({
										index: 0,
										routes: [{name: "Main Tab Navigator"}]
									})
								}}/>
							</View>
						</View>
					</View>
				</ScrollView>
			)}
		</KeyboardAvoidingView>
	);
}

const dimension = Dimensions.get("screen");
const {StatusBarManager} = NativeModules;
const statusBarHeight = Platform.OS === "ios" ? 20 : StatusBarManager.HEIGHT;

const styles = StyleSheet.create({
	container: {
		paddingTop: statusBarHeight
	},

	content_container: {
		paddingTop: "20%",
		justifyContent: "center",
		alignItems: "center"
	},

	inputs_container: {
		marginTop: 50,
		width: "80%",
	},

	input: {
		backgroundColor: "#222222",
		borderColor: "#A3A9AA",
		borderStyle: "solid",
		borderRadius: 5,
		borderWidth: 2,
		paddingVertical: 7,
		paddingHorizontal: 10,
		color: "#A3A9AA",
		fontSize: 16,
		width: "100%",
		marginBottom: 15,
		alignSelf: "center"
	},

	background_image: {
		position: "absolute",
		height: dimension.height,
		width: dimension.width
	},

	button: {
		borderRadius: 5
	}
});