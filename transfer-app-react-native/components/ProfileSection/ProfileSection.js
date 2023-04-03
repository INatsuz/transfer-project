import {Alert, StyleSheet, Text, View} from "react-native";
import RNPickerSelect from "react-native-picker-select"
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {memo, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {logoffAction} from "../../redux/actions/loginActions";
import {Chevron} from "react-native-shapes";
import {getWithAuth, putWithAuth} from "../../utils/Requester";
import {deleteTokens} from "../../utils/TokenManager";

function ProfileSection(props) {
	const dispatch = useDispatch();
	const [vehicles, setVehicles] = useState([]);
	const [activeVehicle, setActiveVehicle] = useState(null);
	const userType = useSelector(state => state.login.userType);

	function updateActiveVehicle(vehicle) {
		let data = {vehicle: vehicle};

		putWithAuth("api/updateActiveVehicle", data).then(res => {
			console.log("Active vehicle changed successfully");
		}).catch(err => {
			console.log(err);
		});
	}

	const onVehicleValueChange = (value, index) => {
		if (value === activeVehicle) {
			return;
		}
		let original_value = activeVehicle;
		setActiveVehicle(value);

		let vehicle = vehicles.find(el => el.ID === value);

		Alert.alert(
			"Confirm",
			`Are you sure you want to change to ${vehicle ? vehicle.displayName : "no vehicle"}.`,
			[
				{
					text: "Yes",
					onPress: () => {
						updateActiveVehicle(value);
					}
				},
				{
					text: "Cancel",
					style: "cancel",
					onPress: () => {
						setActiveVehicle(original_value);
					},
				}
			]
		);
	};

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

	async function fetchVehicles() {
		getWithAuth("api/getVehicles").then(res => {
			setVehicles(res.data.vehicles);
			if (res.data.vehicles.length > 0) {
				if (res.data.vehicles[0].userID !== null) {
					setActiveVehicle(res.data.vehicles[0].ID);
				}
			}
		}).catch(err => {
			console.log(err);
		});
	}

	useEffect(() => {
		if (userType === 2) {
			fetchVehicles();
		}
	}, []);

	return (
		<View style={styles.container}>

			<View style={[styles.area, styles.nameSection, {marginTop: 0}]}>
				<Text style={[styles.textStyle, {flex: 1}]}>Driver: {props.userData.name}</Text>
				<Ionicons name="log-out" size={22} color={styles.textStyle.color} onPress={() => confirmLogoutDialog()}/>
			</View>
			{userType === 2 &&
			<View style={[styles.area, {display: "flex", flexDirection: "row", alignItems: "center"}]}>
				<Text style={styles.textStyle}>Car: </Text>
				<View style={{flex: 1}}>
					<RNPickerSelect value={activeVehicle} items={vehicles.map(item => {
						return {key: item.ID, label: item.displayName, value: item.ID}
					})} onValueChange={onVehicleValueChange} Icon={() => {
						return <Chevron size={1.5} color="gray"/>;
					}} useNativeAndroidPickerStyle={false} style={{
						iconContainer: {justifyContent: "center", padding: 10},
						inputAndroid: styles.textStyle,
						inputAndroidContainer: {padding: 0, justifyContent: "center"},
						inputIOS: styles.textStyle,
						inputIOSContainer: {padding: 0, justifyContent: "center"},
					}}/>
				</View>
			</View>
			}
			<View style={[styles.area, {marginBottom: 0}]}>
				<Text style={styles.textStyle}>{userType === 2 ? "Assigned " : "Total "}
					Jobs: {props.assignment !== [] ? props.assignmentCount : 0}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 5,
		backgroundColor: "#181818",
		borderRadius: 10,
		borderBottomStartRadius: 0,
		borderBottomEndRadius: 0,
		borderColor: "#AB81CD",
		borderWidth: 2,
		borderBottomWidth: 0,
		borderStyle: "solid",
	},

	nameSection: {
		display: "flex",
		flexDirection: "row",
	},

	area: {
		backgroundColor: "#222222",
		marginVertical: 2,
		padding: 5,
		borderRadius: 10
	},

	textStyle: {
		color: "white",
		fontSize: 18
	}
});

export default memo(ProfileSection);