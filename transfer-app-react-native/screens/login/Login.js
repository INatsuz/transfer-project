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
import {useEffect, useRef, useState} from "react";

// import {StackActions, CommonActions} from "@react-navigation/native";

const IP = "81.84.159.96";

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
	await SecureStore.deleteItemAsync("refreshToken");
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
	const password = useRef("");
	const isLoggedIn = useSelector(state => state.login.loggedIn);
	const dispatch = useDispatch();

	useEffect(() => {
		if (isLoggedIn) {
			props.navigation.reset({
				index: 0,
				routes: [{name: "Main Tab Navigator"}]
			});
		}
	}, [isLoggedIn])

	//Checking if logged in on startup
	useEffect(() => {
		getTokens().then(({accessToken, refreshToken}) => {
			if (accessToken || refreshToken) {
				axios.get(`http://${IP}:3000/users/checkLogin?token=${accessToken}`).then(res => {
					console.log("Verified the access token");
					console.log(res.data.loggedIn);

					if (res.data.loggedIn === true) {
						setIsLoading(false);
						dispatch(loginAction(res.data.user));
					}
				}).catch(err => {
					console.log(JSON.stringify(err));
					console.log(err.response);
					console.log(err.response.data);

					if (refreshToken) {
						axios.get(`http://${IP}:3000/users/renew?refreshToken=${refreshToken}`).then(res => {
							console.log("Refreshing the token");
							console.log(res.data.accessToken);
							console.log(res.data.refreshToken);

							if (res.data.accessToken && res.data.refreshToken) {
								saveTokens({
									accessToken: res.data.accessToken,
									refreshToken: res.data.refreshToken
								}).then(() => {
									setIsLoading(false);
									dispatch(loginAction(res.data.user));
								});
							}
						}).catch(err => {
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

	const handleLoginClick = event => {
		axios.post(`http://${IP}:3000/users/login`, {
			email: email,
			password: password.current
		}).then(res => {
			if (res.data.accessToken && res.data.refreshToken) {
				saveTokens(res.data).then(result => {
					dispatch(loginAction(res.data.user));
				});
			}
		}).catch(err => {
			console.log(JSON.stringify(err));
		});
	};

	return (
		<KeyboardAvoidingView keyboardVerticalOffset={20} behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{flex: 1}}>
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
							<TextInput secureTextEntry={true} style={styles.input} placeholder="Password" placeholderTextColor="#A3A9AA" onEndEditing={e => {
								password.current = e.nativeEvent.text;
							}}/>
							<View style={{width: "100%"}}>
								<Button title={"Login"} onPress={handleLoginClick}/>
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
		borderRadius: 5,
		borderColor: "#A3A9AA",
		borderStyle: "solid",
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