import {
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
import React, {useEffect, useState} from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";
import {Chevron} from "react-native-shapes";
import useDrivers from "../../hooks/useDrivers";
import useVehicles from "../../hooks/useVehicles";
import useOperators from "../../hooks/useOperators";
import {postWithAuth} from "../../utils/Requester";

export default function AddAssignment(props) {
	const {userID, isAdmin} = props.route.params;

	const [pickingDate, setPickingDate] = useState(false);
	const [pickingTime, setPickingTime] = useState(false);

	const [drivers] = useDrivers();
	const [vehicles] = useVehicles();
	const [operators] = useOperators();

	const [personName, setPersonName] = useState("");
	const [numberOfPeople, setNumberOfPeople] = useState("");
	const [price, setPrice] = useState("");
	const [paid, setPaid] = useState("");
	const [paymentMethod, setPaymentMethod] = useState(null);
	const [origin, setOrigin] = useState("");
	const [destination, setDestination] = useState("");
	const [date, setDate] = useState(new Date());
	const [time, setTime] = useState(new Date());
	const [status, setStatus] = useState("PENDING");
	const [flight, setFlight] = useState("");
	const [driver, setDriver] = useState(userID ?? null);
	const [vehicle, setVehicle] = useState(null);
	const [operator, setOperator] = useState(null);
	const [observations, setObservations] = useState("");

	let dateString = String(date.getDate()).padStart(2, "0") + "/" + String(date.getMonth() + 1).padStart(2, "0") + "/" + date.getFullYear();
	let timeString = String(time.getHours()).padStart(2, "0") + ":" + String(time.getMinutes()).padStart(2, "0");

	useEffect(() => {
		if (driver) {
			let userVehicle = vehicles.find(vehicle => vehicle.userID === driver);

			if (userVehicle) {
				setVehicle(userVehicle.ID);
			} else {
				setVehicle(null);
			}
		}
	}, [vehicles])

	function onAddPress() {
		let data = {
			person_name: personName,
			num_of_people: numberOfPeople,
			origin,
			destination,
			price: isNaN(parseFloat(price)) ? 0 : price,
			paid: isNaN(parseFloat(paid)) ? 0 : paid,
			paymentMethod,
			flight,
			datetime: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${time.getUTCHours()}:${time.getUTCMinutes()}:00`,
			status,
			driver,
			driverCommission: drivers.find(value => value.ID === driver) ? drivers.find(value => value.ID === driver).commission : 0,
			vehicle,
			operator,
			operatorCommission: operators.find(value => value.ID === operator) ? operators.find(value => value.ID === operator).commission : 0,
			observations
		};

		postWithAuth("api/addTransfer", data).then(res => {
			console.log("Transfer added successfully");
			props.navigation.goBack();
		}).catch(err => {
			console.log(err);
		});
	}

	return (
		<View style={styles.container}>
			{/* Datetime modals */}
			{pickingDate && <DateTimePicker value={date} mode="date" onChange={(event, date) => {
				setPickingDate(false);
				setDate(date);
				setPickingTime(true);
			}}/>}
			{pickingTime && Platform.OS === "android" &&
				<DateTimePicker value={time} mode="time" onChange={(event, time) => {
					setPickingTime(false);
					setTime(time);
				}}/>}

			<KeyboardAvoidingView keyboardVerticalOffset={30} behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
				<ScrollView style={styles.scrollView}>
					{/* Person Name field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Person: </Text>
						<TextInput placeholder={"Person Name"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPersonName(value)}/>
					</View>

					{/* Number of People field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Number of People: </Text>
						<TextInput placeholder={"Number of People"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setNumberOfPeople(value)}/>
					</View>

					{/* Origin field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Origin: </Text>
						<TextInput placeholder={"Origin"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setOrigin(value)}/>
					</View>

					{/* Destination field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Destination: </Text>
						<TextInput placeholder={"Destination"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setDestination(value)}/>
					</View>

					{/* Price field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Price: </Text>
						<TextInput keyboardType={"number-pad"} placeholder={"Price"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPrice(parseFloat(value))}/>
					</View>

					{/* Paid field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Paid: </Text>
						<TextInput keyboardType={"number-pad"} placeholder={"Paid"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPaid(parseFloat(value))}/>
					</View>

					{/* Payment method field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Payment method: </Text>
						<RNPickerSelect value={paymentMethod} items={[{
							label: "Cash",
							value: "CASH",
							key: "CASH"
						}, {
							label: "Card",
							value: "CARD",
							key: "CARD"
						}]} onValueChange={(value) => {
							if (value !== paymentMethod) {
								setPaymentMethod(value);
							}
						}} style={{
							iconContainer: {justifyContent: "center", padding: 15},
							inputAndroidContainer: {...styles.input, justifyContent: "center"},
							inputAndroid: styles.pickerSelect,
							inputIOS: styles.pickerSelect,
							inputIOSContainer: {...styles.input, justifyContent: "center"},
						}} Icon={() => {
							return (<Chevron size={1.5} color="gray"/>);
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					{/* Flight field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Flight: </Text>
						<TextInput placeholder={"Flight"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setFlight(value)}/>
					</View>

					{/* Time/Date field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Time: </Text>
						<Pressable style={{backgroundColor: "blue", zIndex: 10}} onPress={() => {
							console.log("Pressed time");
							if (!pickingDate && !pickingTime) setPickingDate(true);
						}}>
							<TextInput pointerEvents={"none"} editable={false} value={dateString + " - " + timeString} style={[styles.text, styles.input]}/>
						</Pressable>
					</View>

					{/* Status field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Status: </Text>
						<RNPickerSelect value={status} placeholder={{}} items={[{
							label: "PENDING",
							value: "PENDING",
							key: "PENDING"
						}, {
							label: "IN PROGRESS",
							value: "IN PROGRESS",
							key: "IN PROGRESS"
						}, {
							label: "FINISHED",
							value: "FINISHED",
							key: "FINISHED"
						}]} onValueChange={(value) => {
							if (value !== status) {
								setStatus(value);
							}
						}} style={{
							iconContainer: {justifyContent: "center", padding: 15},
							inputAndroidContainer: {...styles.input, justifyContent: "center"},
							inputAndroid: styles.pickerSelect,
							inputIOS: styles.pickerSelect,
							inputIOSContainer: {...styles.input, justifyContent: "center"},
						}} Icon={() => {
							return (<Chevron size={1.5} color="gray"/>);
						}} useNativeAndroidPickerStyle={false}/>
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
									setVehicle(userVehicle.ID);
								} else {
									setVehicle(null);
								}
							}
						}} style={{
							iconContainer: {justifyContent: "center", padding: 15},
							inputAndroidContainer: {
								...styles.input, ...(isAdmin ? {} : styles.disabledPicker),
								justifyContent: "center"
							},
							inputAndroid: {...styles.pickerSelect, ...(isAdmin ? {} : styles.disabledPicker)},
							inputIOS: {...styles.pickerSelect, ...(isAdmin ? {} : styles.disabledPicker)},
							inputIOSContainer: {
								...styles.input, ...(isAdmin ? {} : styles.disabledPicker),
								justifyContent: "center"
							},
						}} Icon={() => {
							return isAdmin ? (<Chevron size={1.5} color="gray"/>) : null;
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					{/* Vehicles field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Vehicle: </Text>
						<RNPickerSelect value={vehicle} items={vehicles.map(item => {
							return {key: item.ID, label: item.displayName, value: item.ID};
						})} onValueChange={(value) => {
							if (value !== vehicle) {
								setVehicle(value);
							}
						}} style={{
							iconContainer: {justifyContent: "center", padding: 15},
							inputAndroidContainer: {...styles.input, justifyContent: "center"},
							inputAndroid: styles.pickerSelect,
							inputIOS: styles.pickerSelect,
							inputIOSContainer: {...styles.input, justifyContent: "center"},
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
							inputAndroid: styles.pickerSelect,
							inputIOS: styles.pickerSelect,
							inputIOSContainer: {...styles.input, justifyContent: "center"},
						}} Icon={() => {
							return (<Chevron size={1.5} color="gray"/>);
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Observations: </Text>
						<TextInput placeholder={"Observations"} placeholderTextColor="#A3A9AA" multiline numberOfLines={2} textAlignVertical={"top"} value={observations ? observations.toString() : ""} style={[styles.text, styles.input]} onChangeText={(value) => setObservations(value)}/>
					</View>

					{/* Add button */}
					<View style={{paddingBottom: 10}}>
						<Button title={"Add"} onPress={onAddPress}/>
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
		paddingVertical: 10,
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
	},

	scrollView: {
		paddingHorizontal: 10,
	},

	section: {
		marginBottom: 15
	},
});