import {StyleSheet, Text, View, Alert} from "react-native";
import RNPickerSelect from "react-native-picker-select"
import Ionicons from "@expo/vector-icons/Ionicons";
import {useState} from "react";
import * as SecureStore from "expo-secure-store";
import {useDispatch} from "react-redux";
import {logoffAction} from "../../../../redux/actions/loginActions";
import {Chevron} from "react-native-shapes";

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

export default function ProfileSection(props) {
	const dispatch = useDispatch();

	const confirmLogoutDialog = () => {
		Alert.alert(
			"Confirm",
			"Are you sure you want to log out?",
			[
				{
					text: "Yes",
					onPress: async () => {
						await deleteTokens();
						dispatch(logoffAction());
						props.navigation.reset({
							index: 0,
							routes: [{name: "Login"}]
						});
					}
				},
				{
					text: "Cancel",
					style: "cancel"
				}
			]
		);
	}

	return (
		<View style={styles.container}>

			<View style={[styles.area, styles.nameSection, {marginTop: 0}]}>
				<Text style={[styles.textStyle, {flex: 1}]}>Driver: {props.userData.name}</Text>
				<Ionicons name="log-out" size={22} color={styles.textStyle.color} onPress={() => confirmLogoutDialog()}/>
			</View>
			<View style={[styles.area, {display: "flex", flexDirection: "row", alignItems: "center"}]}>
				<Text style={styles.textStyle}>Car: </Text>
				<View style={{flex: 1}}>
					<RNPickerSelect value={"opel"} items={[
						{label: "Opel (11-AA-11)", value: "opel"},
						{label: "Citroen (22-BB-22)", value: "citroen"},
						{label: "Ford (33-CC-33)", value: "ford"},
					]} onValueChange={() => {
					}} Icon={() => {
						return <Chevron size={1.5} color="gray"/>;
					}} useNativeAndroidPickerStyle={false} style={{
						iconContainer: {justifyContent: "center"},
						inputAndroid: styles.textStyle,
						inputAndroidContainer: {padding: 0, justifyContent: "center"}
					}}/>
				</View>
			</View>
			<View style={[styles.area, {marginBottom: 0}]}>
				<Text style={styles.textStyle}>Assigned Jobs: {props.assignment !== [] ? props.assignmentCount : 0}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 10,
		backgroundColor: "#181818",
		borderRadius: 10,
		borderColor: "#AB81CD",
		borderWidth: 2,
		borderStyle: "solid",
		marginBottom: 10
	},

	nameSection: {
		display: "flex",
		flexDirection: "row",
	},

	area: {
		backgroundColor: "#222222",
		marginVertical: 5,
		padding: 10,
		borderRadius: 10
	},

	textStyle: {
		color: "white",
		fontSize: 18
	}
});