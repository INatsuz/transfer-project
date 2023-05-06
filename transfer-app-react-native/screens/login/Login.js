import {
	ActivityIndicator,
	Dimensions,
	ImageBackground,
	KeyboardAvoidingView,
	NativeModules,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	ToastAndroid,
	View
} from "react-native";
import Banner from '../../components/Banner/Banner';
import useEmailField from "../../hooks/useEmailField";
import {useDispatch, useSelector} from "react-redux";
import {loginAction} from "../../redux/actions/loginActions";
import axios from 'axios';
import React, {useEffect, useRef, useState} from "react";
import {deleteTokens, getTokens, saveTokens} from "../../utils/TokenManager";
import {getWithAuth, IP} from "../../utils/Requester";
import Button from "../../components/Button/Button";
import {openURL, useURL} from "expo-linking";

export default function Login({route, navigation}) {
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const {email, setEmail, isValidStyling} = useEmailField();
	const password = useRef("");
	const isLoggedIn = useSelector(state => state.login.loggedIn);
	const notificationToken = useSelector(state => state.notification.token);
	const dispatch = useDispatch();
	const url = useURL();

	useEffect(() => {
		if (isLoggedIn) {
			navigation.reset({
				index: 0,
				routes: [{name: "MainTabNavigator"}]
			});

			if (route.params && route.params.shouldRedirect && url) {
				openURL(url);
			}
		}
	}, [isLoggedIn])

	//Checking if logged in on startup
	useEffect(() => {
		console.log("Hello");
		getTokens().then(() => {
			if (Platform.OS === "android") {
				ToastAndroid.show("Checking if already logged in", ToastAndroid.SHORT);
			}
			console.log("There");

			getWithAuth("users/checkLogin").then(res => {
				if (res.data.loggedIn) {
					setIsLoading(false);
					dispatch(loginAction(res.data.user));
				}
			}).catch(err => {
				console.log(err);
				deleteTokens();
				setIsLoading(false);
			});
		}).catch(err => {
			console.log("Error");
			console.log(err);
			setIsLoading(false);
			deleteTokens();
		});
	}, []);

	const handleLoginClick = event => {
		if (!isLoggingIn) {
			setIsLoggingIn(true);
			if (Platform.OS === "android") {
				ToastAndroid.show("Logging in...", ToastAndroid.SHORT);
			}

			axios.post(`https://${IP}/users/login`, {
				email: email,
				password: password.current,
				notificationToken: notificationToken
			}).then(res => {
				setIsLoggingIn(false);
				if (res.data.accessToken && res.data.refreshToken) {
					saveTokens(res.data).then(() => {
						dispatch(loginAction(res.data.user));
					});
				}
			}).catch(err => {
				setIsLoggingIn(false);
				if (Platform.OS === "android") {
					ToastAndroid.show("Login failed... Check your credentials.", ToastAndroid.SHORT);
				}
				console.log(JSON.stringify(err));
			});
		}
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
							<TextInput autoCapitalize={"none"} keyboardType={"email-address"} textContentType={"username"} caretHidden={false} style={[styles.input, isValidStyling()]} placeholder="Email" placeholderTextColor="#A3A9AA" autoComplete={"email"} importantForAutofill={"yes"} onChangeText={setEmail}/>
							<TextInput secureTextEntry={true} textContentType={"password"} style={styles.input} placeholder="Password" placeholderTextColor="#A3A9AA" autoComplete={"password"} importantForAutofill={"yes"} onChangeText={text => password.current = text}/>
							<View style={{width: "100%"}}>
								<Button text={"Login"} onPress={handleLoginClick}/>
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