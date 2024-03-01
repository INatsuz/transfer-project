import {StatusBar} from 'expo-status-bar';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {Platform, useColorScheme} from 'react-native';
import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Login from "./screens/login/Login";
import React, {useEffect, useRef, useState} from "react";
import MainTabNavigator from "./screens/main_tab_navigator/MainTabNavigator";
import {Provider} from "react-redux";
import store from "./redux/setupStore";
import {navigationRef} from './utils/RootNavigation';
import {saveNotificationAction} from "./redux/actions/notificationActions";
import {MenuProvider} from "react-native-popup-menu";
import * as Linking from "expo-linking";
import * as SplashScreen from 'expo-splash-screen';
import {BACKGROUND_COLOR} from "./utils/Colors";
import Constants from "expo-constants";

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export default function App() {
	const [notification, setNotification] = useState(false);
	const notificationListener = useRef();
	const responseListener = useRef();

	const url = Linking.useURL();

	const prefix = Linking.createURL("/");

	useEffect(() => {
		if (url) {
			SplashScreen.hideAsync();
		}
	}, [url])

	const linking = {
		prefixes: [prefix],
		config: {
			screens: {
				initialRouteName: "Login",
				Login: "login",
				MainTabNavigator: {
					screens: {
						HomeNavigator: {
							screens: {
								AddAssignment: "home/add"
							}
						}
					}
				}

			}
		}
	};

	const colorScheme = useColorScheme();

	useEffect(() => {
		registerForPushNotificationsAsync().then(token => {
			store.dispatch(saveNotificationAction(token));
		});

		// This listener is fired whenever a notification is received while the app is foregrounded
		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
			setNotification(notification);
		});

		// This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			console.log(response);
		});

		return () => {
			Notifications.removeNotificationSubscription(notificationListener.current);
			Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	return (
		<Provider store={store}>
			<MenuProvider>
				<StatusBar backgroundColor={BACKGROUND_COLOR} translucent={true}/>
				<NavigationContainer ref={navigationRef} linking={linking} theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<Stack.Navigator>
						<Stack.Screen
							name={"Login"}
							component={Login}
							options={{title: 'Login', headerShown: false}}
						/>
						<Stack.Screen
							name={"MainTabNavigator"}
							component={MainTabNavigator}
							options={{title: 'Main Tab Navigator', headerShown: false}}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</MenuProvider>
		</Provider>
	);
}

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
async function sendPushNotification(expoPushToken) {
	const message = {
		to: expoPushToken,
		sound: 'default',
		title: 'Original Title',
		body: 'And here is the body!',
		data: {someData: 'goes here'},
	};

	await fetch('https://exp.host/--/api/v2/push/send', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Accept-encoding': 'gzip, deflate',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(message),
	});
}

async function registerForPushNotificationsAsync() {
	let token;

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		});
	}

	if (Device.isDevice) {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!');
			return;
		}
		token = await Notifications.getExpoPushTokenAsync({
			projectId: Constants.expoConfig.extra.eas.projectId,
		});
		console.log(token);
	} else {
		alert('Must use physical device for Push Notifications');
	}

	return token.data;
}
