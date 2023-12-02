import {Alert, Platform, StyleSheet, Text, View} from "react-native";
import RNPickerSelect from "react-native-picker-select"
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {memo, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {logoffAction} from "../../redux/actions/loginActions";
import {Chevron} from "react-native-shapes";
import {getWithAuth, putWithAuth} from "../../utils/Requester";
import {deleteTokens} from "../../utils/TokenManager";
import {BACKGROUND_COLOR, ITEM_BORDER_COLOR, TEXT_COLOR} from "../../utils/Colors";

function ProfileSection(props) {
	const dispatch = useDispatch();
	const [vehicles, setVehicles] = useState([]);
	const [activeVehicle, setActiveVehicle] = useState(null);
	const originalVehicle = useRef()
	const userType = useSelector(state => state.login.userType);
	const userID = useSelector(state => state.login.userID);

	function updateActiveVehicle(vehicle) {
		let data = {vehicle: vehicle};

		putWithAuth("api/updateActiveVehicle", data).then(res => {
			console.log("Active vehicle changed successfully");
			originalVehicle.current = vehicle;
		}).catch(err => {
			setActiveVehicle(originalVehicle.current);
			console.log(err);
		});
	}

	const onVehicleValueChange = (value, index) => {
		if (value === activeVehicle) {
			return;
		}
		setActiveVehicle(value);

		if (Platform.OS === "android") {
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
							setActiveVehicle(originalVehicle.current);
						},
					}
				]
			);
		}
	};

	function onVehicleSelectClose() {
		let vehicle = vehicles.find(el => el.ID === activeVehicle);

		Alert.alert(
			"Confirm",
			`Are you sure you want to change to ${vehicle ? vehicle.displayName : "no vehicle"}.`,
			[
				{
					text: "Yes",
					onPress: () => {
						updateActiveVehicle(activeVehicle);
					}
				},
				{
					text: "Cancel",
					style: "cancel",
					onPress: () => {
						setActiveVehicle(originalVehicle.current);
					},
				}
			]
		);
	}

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
				if (res.data.vehicles[0].userID === userID) {
					setActiveVehicle(res.data.vehicles[0].ID);
					originalVehicle.current = res.data.vehicles[0].ID;
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
			<View style={[styles.area, styles.nameSection]}>
				<Text style={[styles.textStyle, {flex: 1}]}>Driver: {props.userData.name}</Text>
				<Ionicons name="log-out" size={22} color={styles.textStyle.color} onPress={() => confirmLogoutDialog()}/>
			</View>
			<View style={[styles.area, styles.nameSection]}>
				{
					<Text style={[styles.textStyle, {flex: 1}]}>Total Received: €{parseFloat(props.assignments.reduce((sum, value) => sum + (value.payment_method === "CASH" ? value.paid : 0), 0)).toFixed(2)}</Text>
				}
			</View>
			{userType === 2 &&
				<View style={[styles.area, styles.carPickerArea]}>
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
						}} onClose={onVehicleSelectClose}/>
					</View>
				</View>
			}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: BACKGROUND_COLOR,
	},

	carPickerArea: {
		borderTopWidth: 1,
		borderTopColor: ITEM_BORDER_COLOR,
		display: "flex",
		flexDirection: "row",
		alignItems: "center"
	},

	nameSection: {
		display: "flex",
		borderTopColor: "#474746",
		borderTopWidth: 1,
		flexDirection: "row",
		padding: 6,
	},

	area: {
		backgroundColor: "#F0F0F0",
		padding: 5,
	},

	textStyle: {
		color: TEXT_COLOR,
		fontSize: 18
	}
});

export default memo(ProfileSection);
