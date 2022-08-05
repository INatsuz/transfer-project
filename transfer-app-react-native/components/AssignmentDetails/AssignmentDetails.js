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
import {useEffect, useState} from "react";
import axios from "axios";
import {deleteWithAuth, getWithAuth, IP, putWithAuth} from "../../utils/Requester";
import useOperators from "../../hooks/useOperators";
import {getTokens} from "../../utils/TokenManager";

export default function AssignmentDetails(props) {
	let {assignment, isEditable} = props.route.params;

	const [pickingDate, setPickingDate] = useState(false);
	const [pickingTime, setPickingTime] = useState(false);
	const [personName, setPersonName] = useState(assignment.person_name);
	const [numberOfPeople, setNumberOfPeople] = useState(assignment.num_of_people);
	const [origin, setOrigin] = useState(assignment.origin);
	const [destination, setDestination] = useState(assignment.destination);
	const [price, setPrice] = useState(assignment.price);
	const [date, setDate] = useState(new Date(assignment.transfer_time));
	const [time, setTime] = useState(new Date(assignment.transfer_time));
	const [flight, setFlight] = useState(assignment.flight);
	const [driver, setDriver] = useState(assignment.driver);
	const [driverName] = useState(assignment.driverName);
	const [activeVehicle, setActiveVehicle] = useState(assignment.vehicle);
	const [operator, setOperator] = useState(assignment.service_operator);
	const [observations, setObservations] = useState(assignment.observations);

	const [drivers, setDrivers] = useState(driver ? [{ID: assignment.driver, name: assignment.driverName}] : []);
	const [vehicles, setVehicles] = useState(activeVehicle ? [{ID: assignment.vehicle, displayName: assignment.vehicleName}] : []);
	const [operators] = useOperators(operator, assignment.operatorName);

	let datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
	let dateString = String(datetime.getDate()).padStart(2, "0") + "/" + String(datetime.getMonth() + 1).padStart(2, "0") + "/" + datetime.getFullYear();
	let timeString = String(datetime.getHours()).padStart(2, "0") + ":" + String(datetime.getMinutes()).padStart(2, "0");

	async function fetchDrivers() {
		getWithAuth("api/getDrivers").then(res => {
			setDrivers(res.data.drivers);
		}).catch(err => {
			console.log(err.response);
		});
	}

	function updateVehicleByDriver(newDriver) {
		let cur_driver = drivers.find(el => el.ID === newDriver);
		if (cur_driver) setActiveVehicle(cur_driver.activeVehicle);
	}

	async function fetchVehicles() {
		getWithAuth("api/getVehicles").then(res => {
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


	function onSavePress() {
		putWithAuth("api/updateTransfer", {
			ID: assignment.ID,
			person_name: personName,
			num_of_people: numberOfPeople,
			flight: flight,
			origin: origin,
			destination: destination,
			price: price,
			time: `${datetime.getUTCFullYear()}-${datetime.getUTCMonth() + 1}-${datetime.getUTCDate()} ${datetime.getUTCHours()}:${datetime.getUTCMinutes()}:00`,
			driver: driver,
			vehicle: activeVehicle,
			operator: operator,
			observations: observations
		}).then(() => {
			props.navigation.navigate("Assignments");
		}).catch(err => {
			console.log(err.response.data);
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
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
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
							<TextInput keyboardType={"number-pad"} value={numberOfPeople.toString()} style={[styles.text, styles.input]} onChangeText={(value) => setNumberOfPeople(value)}/> :
							<Text style={styles.text}>{numberOfPeople.toString()}</Text>}
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Flight: </Text>
						{
							isEditable ?
								<TextInput value={flight ? flight.toString() : ""} style={[styles.text, styles.input]} onChangeText={(value) => setFlight(value)}/>
								:
								<Text style={styles.text}>{flight ? flight.toString() : "No flight"}</Text>
						}
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
						<Text style={[styles.text, styles.title]}>Price: </Text>
						{isEditable ?
							<TextInput value={price.toString()} style={[styles.text, styles.input]} onChangeText={(value) => setPrice(value)}/> :
							<Text style={styles.text}>{price.toString()}</Text>}
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
									}
								}} style={{
									iconContainer: {justifyContent: "center", padding: 15},
									inputAndroidContainer: {...styles.input, justifyContent: "center"},
									inputAndroid: styles.pickerSelect
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
										setActiveVehicle(value);
									}
								}} style={{
									iconContainer: {justifyContent: "center", padding: 15},
									inputAndroidContainer: {...styles.input, justifyContent: "center"},
									inputAndroid: styles.pickerSelect
								}} Icon={() => {
									return (<Chevron size={1.5} color="gray"/>);
								}} useNativeAndroidPickerStyle={false}/>

								:

								<Text style={styles.text}>{assignment.vehicleName ? assignment.vehicleName : "No vehicle chosen"}</Text>
						}
					</View>

					{/* Operators field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Operator: </Text>
						{
							isEditable ?
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

								:

								<Text style={styles.text}>{assignment.service_operator ? assignment.service_operator : "No operator"}</Text>
						}
					</View>

					{/* Observations field */}
					<View style={isEditable ? styles.section : {}}>
						<Text style={[styles.text, styles.title]}>Observations: </Text>
						{
							isEditable ?
								<TextInput multiline numberOfLines={2} textAlignVertical={"top"} value={observations ? observations.toString() : ""} style={[styles.text, styles.input]} onChangeText={(value) => setObservations(value)}/>
								:
								<Text style={styles.text}>{observations ? observations.toString() : "No observations"}</Text>
						}
					</View>

					{/*
					Save and delete buttons
					Only show up when the fields are editable
					*/}
					{isEditable &&
						<View style={styles.section}>
							<Button title={"Save"} onPress={onSavePress}/>
						</View>
					}
					{isEditable &&
						<View>
							<Button color={"#dc3545"} title={"Delete"} onPress={onDeletePress}/>
						</View>
					}
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