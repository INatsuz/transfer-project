import {Alert, Button, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from '@react-native-community/datetimepicker';
import {Chevron} from "react-native-shapes";
import {useEffect, useState} from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {deleteWithAuth, getWithAuth} from "../../utils/Requester";
import {logoffAction} from "../../redux/actions/loginActions";

const IP = "vraminhos.com";

async function getTokens() {
	let accessToken = await SecureStore.getItemAsync("accessToken");
	let refreshToken = await SecureStore.getItemAsync("refreshToken");

	if (accessToken && refreshToken) {
		return {accessToken: accessToken, refreshToken: refreshToken};
	} else {
		return false;
	}
}

export default function AssignmentDetails(props) {
	const {assignment, isEditable} = props.route.params;
	const [pickingDate, setPickingDate] = useState(false);
	const [pickingTime, setPickingTime] = useState(false);
	const [personName, setPersonName] = useState(assignment.person_name);
	const [numberOfPeople, setNumberOfPeople] = useState(assignment.num_of_people);
	const [origin, setOrigin] = useState(assignment.origin);
	const [destination, setDestination] = useState(assignment.destination);
	const [date, setDate] = useState(new Date(assignment.transfer_time));
	const [time, setTime] = useState(new Date(assignment.transfer_time));
	const [driver, setDriver] = useState(assignment.driver);
	const [driverName, setDriverName] = useState(assignment.driverName);
	const [activeVehicle, setActiveVehicle] = useState(assignment.vehicle);

	const [drivers, setDrivers] = useState(driver ? [{ID: assignment.driver, name: assignment.driverName}] : []);
	const [vehicles, setVehicles] = useState(activeVehicle ? [{
		ID: assignment.vehicle,
		displayName: assignment.vehicleName
	}] : []);


	let datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
	let dateString = String(datetime.getDate()).padStart(2, "0") + "/" + String(datetime.getMonth() + 1).padStart(2, "0") + "/" + datetime.getFullYear();
	let timeString = String(datetime.getHours()).padStart(2, "0") + ":" + String(datetime.getMinutes()).padStart(2, "0");

	function fetchDrivers() {
		getTokens().then(({accessToken, refreshToken}) => {
			axios.get(`http://${IP}:3000/api/getDrivers`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then(res => {
				setDrivers(res.data.drivers);
			}).catch(err => {
				console.log(err.response);
			});
		});
	}

	function updateVehicleByDriver(newDriver) {
		console.log("Updating vehicle");
		let cur_driver = drivers.find(el => el.ID === newDriver);
		if (cur_driver) setActiveVehicle(cur_driver.activeVehicle);
	}

	function fetchVehicles() {
		getWithAuth("api/getVehicles").then(res => {
			console.log(res.data);
			setVehicles(res.data.vehicles);
		}).catch(err => {
			console.log(err);
		});
	}

	useEffect(() => {
		if (isEditable) {
			fetchVehicles();
			fetchDrivers();
		}
	}, []);

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: "#222222",
			borderTopColor: "#AB81CD",
			borderTopWidth: 1,
			borderStyle: "solid",
			paddingVertical: 10
		},

		scrollView: {
			paddingHorizontal: 10,
		},

		section: {
			marginBottom: 15
		},

		text: {
			color: "#fff",
			fontSize: 18
		},

		title: {
			fontWeight: "bold",
			paddingBottom: 10
		},

		textStyle: {
			color: "white",
			fontSize: 18
		},

		input: {
			backgroundColor: "#222222",
			borderRadius: 5,
			borderColor: "#A3A9AA",
			borderStyle: "solid",
			borderWidth: 2,
			paddingVertical: 7,
			paddingHorizontal: 10,
			color: "white",
			fontSize: 16,
			width: "100%",
			alignSelf: "center"
		}
	});

	function onSavePress() {
		getTokens().then(({accessToken, refreshToken}) => {
			axios.put(`http://${IP}:3000/api/updateTransfer`, {
				ID: assignment.ID,
				person_name: personName,
				num_of_people: numberOfPeople,
				origin: origin,
				destination: destination,
				time: `${datetime.getUTCFullYear()}-${datetime.getUTCMonth() + 1}-${datetime.getUTCDate()} ${datetime.getUTCHours()}:${datetime.getUTCMinutes()}:00`,
				driver: driver,
				vehicle: activeVehicle
			}, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then(res => {
				console.log("Transfer changed successfully");
				props.navigation.navigate("Assignments");
			}).catch(err => {
				console.log(err.response.data);
			});
		});
	}

	function onDeletePress() {
		Alert.alert(
			"Confirm",
			"Are you sure you want delete this assignment?",
			[
				{
					text: "Yes",
					onPress: async () => {
						deleteWithAuth(`api/removeTransfer/${assignment.ID}`).then(res => {
							console.log(res.data);
							props.navigation.navigate("Assignments");
						}).catch(err => {
							console.log(err);
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
			<ScrollView style={styles.scrollView}>
				{pickingDate && <DateTimePicker value={datetime} mode="date" onChange={(event, date) => {
					setPickingDate(false);
					setDate(date);
					setPickingTime(true);
				}}/>}
				{pickingTime && <DateTimePicker value={datetime} mode="time" onChange={(event, time) => {
					setTime(time);
					setPickingTime(false);
				}}/>}
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Person: </Text>
					{isEditable ?
						<TextInput value={personName} style={[styles.text, styles.input]} onChangeText={(value) => setPersonName(value)}/> :
						<Text style={styles.text}>{personName}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Number of People: </Text>
					{isEditable ?
						<TextInput value={numberOfPeople.toString()} style={[styles.text, styles.input]} onChangeText={(value) => setNumberOfPeople(value)}/> :
						<Text style={styles.text}>{numberOfPeople}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Origin: </Text>
					{isEditable ?
						<TextInput value={origin} style={[styles.text, styles.input]} onChangeText={(value) => setOrigin(value)}/> :
						<Text style={styles.text}>{origin}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Destination: </Text>
					{isEditable ?
						<TextInput value={destination} style={[styles.text, styles.input]} onChangeText={(value) => setDestination(value)}/> :
						<Text style={styles.text}>{destination}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Time: </Text>
					{
						isEditable ?
							<Pressable onPress={() => setPickingDate(true)}>
								<TextInput editable={false} value={dateString + " - " + timeString} style={[styles.text, styles.input]}/>
							</Pressable>
							:
							<Text style={styles.text}>{dateString} - {timeString}</Text>
					}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Driver: </Text>
					{
						isEditable ?
							<RNPickerSelect value={driver} items={drivers.map(item => {
								return {key: item.ID, label: item.name, value: item.ID};
							})} onValueChange={(value) => {
								if (value !== driver) {
									setDriver(value);
									updateVehicleByDriver(value);
									console.log("Vehicle changed");
								}
							}} style={{
								iconContainer: {justifyContent: "center", padding: 15},
								inputAndroidContainer: {...styles.input, justifyContent: "center"},
								inputAndroid: styles.textStyle
							}} Icon={() => {
								return (<Chevron size={1.5} color="gray"/>);
							}} useNativeAndroidPickerStyle={false}/>

							:

							<Text style={styles.text}>{driverName}</Text>
					}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Vehicle: </Text>
					{
						isEditable ?
							<RNPickerSelect value={activeVehicle} items={vehicles.map(item => {
								return {key: item.ID, label: item.displayName, value: item.ID};
							})} onValueChange={(value, index) => {
								if (value !== activeVehicle) {
									console.log(value);
									setActiveVehicle(value);
								}
							}} style={{
								iconContainer: {justifyContent: "center", padding: 15},
								inputAndroidContainer: {...styles.input, justifyContent: "center"},
								inputAndroid: styles.textStyle
							}} Icon={() => {
								return (<Chevron size={1.5} color="gray"/>);
							}} useNativeAndroidPickerStyle={false}/>

							:

							<Text style={styles.text}>{assignment.vehicleName ? assignment.vehicleName : "No vehicle chosen"}</Text>
					}
				</View>
				<View style={styles.section}>
					{isEditable && <Button title={"Save"} onPress={onSavePress}/>}
				</View>
				<View>
					{isEditable && <Button color={"#E11218"} title={"Delete"} onPress={onDeletePress}/>}
				</View>
			</ScrollView>
		</View>
	);
};
