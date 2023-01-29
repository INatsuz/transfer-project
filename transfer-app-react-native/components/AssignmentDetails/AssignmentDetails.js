import {
	Alert,
	Button,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from '@react-native-community/datetimepicker';
import {Chevron} from "react-native-shapes";
import React, {useEffect, useState} from "react";
import {deleteWithAuth, getWithAuth, putWithAuth} from "../../utils/Requester";
import useOperators from "../../hooks/useOperators";
import useVehicles from "../../hooks/useVehicles";
import useDrivers from "../../hooks/useDrivers";

export default function AssignmentDetails(props) {
	let {assignment, isAdmin} = props.route.params;

	const [pickingDate, setPickingDate] = useState(false);
	const [pickingTime, setPickingTime] = useState(false);
	const [personName, setPersonName] = useState(assignment.person_name);
	const [numberOfPeople, setNumberOfPeople] = useState(assignment.num_of_people);
	const [origin, setOrigin] = useState(assignment.origin);
	const [destination, setDestination] = useState(assignment.destination);
	const [price, setPrice] = useState(assignment.price);
	const [paid, setPaid] = useState(assignment.paid);
	const [date, setDate] = useState(new Date(assignment.transfer_time));
	const [time, setTime] = useState(new Date(assignment.transfer_time));
	const [flight, setFlight] = useState(assignment.flight);
	const [driver, setDriver] = useState(assignment.driver);
	const [activeVehicle, setActiveVehicle] = useState(assignment.vehicle);
	const [operator, setOperator] = useState(assignment.service_operator);
	const [observations, setObservations] = useState(assignment.observations);

	const [drivers] = useDrivers(driver, assignment.driverName);
	const [vehicles] = useVehicles(activeVehicle, assignment.vehicleName);
	const [operators] = useOperators(operator, assignment.operatorName);

	let datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
	let dateString = String(datetime.getDate()).padStart(2, "0") + "/" + String(datetime.getMonth() + 1).padStart(2, "0") + "/" + datetime.getFullYear();
	let timeString = String(datetime.getHours()).padStart(2, "0") + ":" + String(datetime.getMinutes()).padStart(2, "0");

	function onSavePress() {
		putWithAuth("api/updateTransfer", {
			ID: assignment.ID,
			person_name: personName,
			num_of_people: numberOfPeople,
			flight: flight,
			origin: origin,
			destination: destination,
			price: isNaN(parseFloat(price)) ? 0 : price,
			paid: isNaN(parseFloat(paid)) ? 0 : paid,
			time: `${datetime.getUTCFullYear()}-${datetime.getUTCMonth() + 1}-${datetime.getUTCDate()} ${datetime.getUTCHours()}:${datetime.getUTCMinutes()}:00`,
			driver: driver,
			driverCommission: drivers.find(value => value.ID === driver) ? drivers.find(value => value.ID === driver).commission : 0,
			vehicle: activeVehicle,
			operator: operator,
			operatorCommission: operators.find(value => value.ID === operator) ? operators.find(value => value.ID === operator).commission : 0,
			observations: observations
		}).then(() => {
			props.navigation.goBack();
		}).catch(err => {
			console.log(err);
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
							props.navigation.goBack("Assignments");
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
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{flex: 1}}>
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
						<TextInput value={personName} style={[styles.text, styles.input]} onChangeText={(value) => setPersonName(value)}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Number of People: </Text>
						<TextInput value={numberOfPeople.toString()} style={[styles.text, styles.input]} onChangeText={(value) => setNumberOfPeople(value)}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Flight: </Text>
						<TextInput value={flight ? flight.toString() : ""} style={[styles.text, styles.input]} onChangeText={(value) => setFlight(value)}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Origin: </Text>
						<TextInput value={origin} style={[styles.text, styles.input]} onChangeText={(value) => setOrigin(value)}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Destination: </Text>
						<TextInput value={destination} style={[styles.text, styles.input]} onChangeText={(value) => setDestination(value)}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Price: </Text>
						<TextInput keyboardType={"number-pad"} value={price.toString()} style={[styles.text, styles.input]} onChangeText={(value) => setPrice(value)}/>
					</View>

					{/* Paid field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Paid: </Text>
						<TextInput keyboardType={"number-pad"} value={paid.toString()} placeholder={"Paid"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPaid(value)}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Time: </Text>
						<Pressable onPress={() => setPickingDate(true)}>
							<TextInput editable={false} value={dateString + " - " + timeString} style={[styles.text, styles.input]}/>
						</Pressable>
					</View>

					{/* Drivers field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Driver: </Text>
						<RNPickerSelect disabled={!isAdmin} value={driver} items={drivers.map(item => {
							return {key: item.ID, label: item.name, value: item.ID};
						})} onValueChange={(value) => {
							if (value !== driver) {
								setDriver(value);
								let userVehicle = vehicles.find(vehicle => vehicle.userID === value);

								if (userVehicle) {
									setActiveVehicle(userVehicle.ID);
								} else {
									setActiveVehicle(null);
								}
							}
						}} style={{
							iconContainer: {justifyContent: "center", padding: 15},
							inputAndroidContainer: {
								...styles.input, ...styles.disabledPicker,
								justifyContent: "center"
							},
							inputAndroid: {...styles.pickerSelect, ...(isAdmin ? {} : styles.disabledPicker)}
						}} Icon={() => {
							return isAdmin ? (<Chevron size={1.5} color="gray"/>) : null;
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					{/* Vehicles field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Vehicle: </Text>
						<RNPickerSelect value={activeVehicle} items={vehicles.map(item => {
							return {key: item.ID, label: item.displayName, value: item.ID};
						})} onValueChange={(value, index) => {
							if (value !== activeVehicle) {
								setActiveVehicle(value);
							}
						}} style={{
							iconContainer: {justifyContent: "center", padding: 15},
							inputAndroidContainer: {...styles.input, justifyContent: "center"},
							inputAndroid: styles.pickerSelect
						}} Icon={() => {
							return (<Chevron size={1.5} color="gray"/>);
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					{/* Operators field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Operator: </Text>
						<RNPickerSelect value={operator} items={operators.map(item => {
							return {key: item.ID, label: item.name, value: item.ID};
						})} onValueChange={(value) => {
							if (value !== operator) {
								setOperator(value);
							}
						}} style={{
							iconContainer: {justifyContent: "center", padding: 15},
							inputAndroidContainer: {...styles.input, justifyContent: "center"},
							inputAndroid: styles.pickerSelect
						}} Icon={() => {
							return (<Chevron size={1.5} color="gray"/>);
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					{/* Observations field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Observations: </Text>
						<TextInput multiline numberOfLines={2} textAlignVertical={"top"} value={observations ? observations.toString() : ""} style={[styles.text, styles.input]} onChangeText={(value) => setObservations(value)}/>
					</View>

					{/*
					Save and delete buttons
					Only show up when the fields are editable
					*/}
					<View style={styles.section}>
						<Button title={"Save"} onPress={onSavePress}/>
					</View>
					<View>
						<Button color={"#dc3545"} title={"Delete"} onPress={onDeletePress}/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
};

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

	pickerSelect: {
		color: "#fff",
		fontSize: 16
	},

	disabledPicker: {
		color: "#A3A9AA",
		fontSize: 16
	},

	title: {
		fontWeight: "bold",
		paddingBottom: 10
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