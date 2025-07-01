import {Alert, Platform, StyleSheet, Text, View} from "react-native";
import RNPickerSelect from "react-native-picker-select"
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {memo, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {logoffAction} from "../../redux/actions/loginActions";
import {Chevron} from "react-native-shapes";
import {getWithAuth, putWithAuth} from "../../utils/Requester";
import {deleteTokens} from "../../utils/TokenManager";
import {ACCENT_COLOR, BACKGROUND_COLOR, ITEM_BACKGROUND_COLOR, TEXT_COLOR} from "../../utils/Colors";

function ProfileSection(props) {
	const dispatch = useDispatch();
	const [vehicles, setVehicles] = useState([]);
	const [activeVehicle, setActiveVehicle] = useState(null);
	const originalVehicle = useRef();
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
			console.log(res.data);
			console.log(res.data.vehicle, "===");
			setVehicles(res.data.vehicles);
			if (res.data.vehicles.length > 0) {
				res.data.vehicles.forEach(vehicle => {
					if (vehicle.userID === userID) {
						setActiveVehicle(vehicle.ID);
						originalVehicle.current = vehicle.ID;
						console.log(vehicle.ID);
					}
				})
			}
		}).catch(err => {
			console.log(err);
		});
	}

	useEffect(() => {
		fetchVehicles();
	}, []);
	console.log(activeVehicle);
	console.log(props);

	return (
		<View style={styles.container}>
			<View style={[styles.area, styles.nameSection]}>
				<Text style={[styles.textStyle, {flex: 1}]}>Driver: {props.userData.name}</Text>
				<Ionicons name="log-out" size={22} color={styles.textStyle.color} onPress={() => confirmLogoutDialog()}/>
			</View>
			<View style={[styles.area, styles.nameSection]}>
				<Text style={[styles.textStyle, {flex: 1}]}>Total Received:
					€{parseFloat(props.assignments.reduce((sum, value) => sum + (value.payment_method === "CASH" ? value.paid : 0), 0)).toFixed(2)}</Text>
			</View>
			<View style={[styles.area, styles.carPickerArea, {
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				paddingVertical: 0,
				margin: 0
			}]}>
				<Text style={styles.textStyle}>Car: </Text>
				<View style={{flex: 1}}>
					<RNPickerSelect value={activeVehicle} textInputProps={{pointerEvents: "none"}} items={vehicles.map(item => {
						return {key: item.ID, label: item.displayName, value: item.ID}
					})} onValueChange={onVehicleValueChange} Icon={() => {
						return <Chevron size={1.5} color="gray"/>;
					}} useNativeAndroidPickerStyle={false} style={{
						iconContainer: {justifyContent: "center", padding: 10},
						inputAndroid: styles.textStyle,
						inputAndroidContainer: {justifyContent: "center", paddingVertical: 5},
						inputIOS: {...styles.textStyle, paddingVertical: 7,},
						inputIOSContainer: {justifyContent: "center"},
					}} onClose={onVehicleSelectClose}/>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: BACKGROUND_COLOR,
	},

	nameSection: {
		display: "flex",
		borderTopWidth: 1,
		borderTopColor: ACCENT_COLOR,
		flexDirection: "row",
		padding: 6,
	},

	carPickerArea: {
		borderTopWidth: 1,
		borderTopColor: ACCENT_COLOR,
		display: "flex",
		flexDirection: "row",
		alignItems: "center"
	},

	area: {
		backgroundColor: ITEM_BACKGROUND_COLOR,
		paddingHorizontal: 5,
	},

	textStyle: {
		color: TEXT_COLOR,
		fontSize: 18,
		paddingVertical: 2
	}
});

export default memo(ProfileSection);
