import {
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
import Button from "../Button/Button";
import {useSelector} from "react-redux";
import {useNavigation} from "@react-navigation/native";
import {useURL} from "expo-linking";
import {ACCENT_COLOR, BACKGROUND_COLOR, DISABLED_TEXT_COLOR, ITEM_BORDER_COLOR, TEXT_COLOR} from "../../utils/Colors";

export default function AddAssignment(props) {
	const userID = useSelector(state => state.login.userID);
	const userType = useSelector(state => state.login.userType);
	const isAdmin = userType === 1 || userType === 4;
	const isLoggedIn = useSelector(state => state.login.loggedIn);
	const navigation = useNavigation();

	const url = useURL();

	useEffect(() => {
		if (!isLoggedIn) {
			navigation.navigate("Login", {shouldRedirect: true});
		}
	}, [isLoggedIn, url]);

	const [pickingDate, setPickingDate] = useState(false);
	const [pickingTime, setPickingTime] = useState(false);

	const [drivers] = useDrivers();
	const [vehicles] = useVehicles();
	const [operators] = useOperators();

	const [personName, setPersonName] = useState(props.route.params && props.route.params.name ? props.route.params.name : "");
	const [numberOfPeople, setNumberOfPeople] = useState(props.route.params && props.route.params.people ? props.route.params.people : "");
	const [price, setPrice] = useState(props.route.params && props.route.params.price ? props.route.params.price : "");
	const [paid, setPaid] = useState(props.route.params && props.route.params.paid ? props.route.params.paid : "");
	const [paymentMethod, setPaymentMethod] = useState(props.route.params && props.route.params.paymentMethod ? props.route.params.paymentMethod : null);
	const [origin, setOrigin] = useState(props.route.params && props.route.params.origin ? props.route.params.origin : "");
	const [destination, setDestination] = useState(props.route.params && props.route.params.destination ? props.route.params.destination : "");
	const [date, setDate] = useState(props.route.params && props.route.params.datetime ? new Date(props.route.params.datetime) : new Date());
	const [time, setTime] = useState(props.route.params && props.route.params.datetime ? new Date(props.route.params.datetime) : new Date());
	const [status, setStatus] = useState(props.route.params && props.route.params.status ? props.route.params.status : "PENDING");
	const [flight, setFlight] = useState(props.route.params && props.route.params.flight ? props.route.params.flight : "");
	const [driver, setDriver] = useState(userType === 1 ? null : userID ?? null);
	const [vehicle, setVehicle] = useState(null);
	const [operator, setOperator] = useState(null);
	const [observations, setObservations] = useState(props.route.params && props.route.params.observations ? props.route.params.observations : "");

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

	useEffect(() => {
		if (props.route.params && props.route.params.operator) {
			let operator = operators.find(op => op.name === props.route.params.operator);

			if (operator) {
				setOperator(operator.ID);
			} else {
				setOperator(null);
			}
		}
	}, [operators])

	function onAddPress() {
		date.setHours(time.getHours(), time.getMinutes());

		let data = {
			person_name: personName,
			num_of_people: numberOfPeople,
			origin,
			destination,
			price: isNaN(parseFloat(price)) ? 0 : price,
			paid: isNaN(parseFloat(paid)) ? 0 : paid,
			paymentMethod,
			flight,
			datetime: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:00`,
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

	function onTimePress() {
		if (Platform.OS === "android") {
			if (!pickingDate && !pickingTime) setPickingDate(true);
		}
	}

	return (
		<View style={styles.container}>
			{/* Datetime modals */}
			{pickingDate && Platform.OS === "android" &&
				<DateTimePicker value={date} mode="date" onChange={(event, date) => {
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
						<Text style={[styles.text, styles.title]}>Name: </Text>
						<TextInput placeholder={"Name"} defaultValue={personName} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPersonName(value)}/>
					</View>

					{/* Origin field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Origin: </Text>
						<TextInput placeholder={"Origin"} defaultValue={origin} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setOrigin(value)}/>
					</View>

					{/* Destination field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Destination: </Text>
						<TextInput placeholder={"Destination"} defaultValue={destination} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setDestination(value)}/>
					</View>

					{/* Number of People field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Pax: </Text>
						<TextInput placeholder={"Pax"} defaultValue={numberOfPeople} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setNumberOfPeople(value)}/>
					</View>

					{/* Time/Date field */}
					{
						Platform.OS === "ios" ?
							<View style={styles.iosTimeSection}>
								<View>
									<Text style={[styles.text, styles.title, {paddingBottom: 0}]}>Time: </Text>
								</View>

								<DateTimePicker value={date} mode="datetime" preferredDatePickerStyle={"compact"} onChange={(event, datetime) => {
									setDate(datetime);
									setTime(datetime);
								}}/>
							</View>
							:
							<View style={styles.section}>
								<Text style={[styles.text, styles.title]}>Time: </Text>
								<Pressable onPress={onTimePress}>
									<TextInput pointerEvents={"none"} editable={false} value={dateString + " - " + timeString} style={[styles.text, styles.input]}/>
								</Pressable>
							</View>
					}

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
						}, {
							label: "CONFIRMED",
							value: "CONFIRMED",
							key: "CONFIRMED"
						}, {
							label: "CANCELLED",
							value: "CANCELLED",
							key: "CANCELLED"
						}, {
							label: "REVIEW",
							value: "REVIEW",
							key: "REVIEW"
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
							placeholder: styles.pickerPlaceholder
						}} Icon={() => {
							return (<Chevron size={1.5} color={DISABLED_TEXT_COLOR}/>);
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					{/* Flight field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Flight: </Text>
						<TextInput placeholder={"Flight"} defaultValue={flight} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setFlight(value)}/>
					</View>

					{/* Price field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Price: </Text>
						<TextInput keyboardType="numeric" defaultValue={price.toString()} placeholder={"Price"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => {
							let dotted_value = value.replace(",", ".");
							setPrice(parseFloat(dotted_value));
						}}/>
					</View>

					{/* Paid field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Paid: </Text>
						<TextInput keyboardType="numeric" defaultValue={paid.toString()} placeholder="Paid" placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => {
							let dotted_value = value.replace(",", ".");
							setPaid(parseFloat(dotted_value));
						}}/>
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
						}, {
							label: "Bank Transfer",
							value: "TRANSFER",
							key: "TRANSFER"
						}, {
							label: "CC",
							value: "CC",
							key: "CC"
						}, {
							label: "Return",
							value: "RETURN",
							key: "RETURN"
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
							placeholder: styles.pickerPlaceholder
						}} Icon={() => {
							return (<Chevron size={1.5} color={DISABLED_TEXT_COLOR}/>);
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
								if (value !== null) {
									let userVehicle = vehicles.find(vehicle => vehicle.userID === value);

									if (userVehicle) {
										setVehicle(userVehicle.ID);
									} else {
										setVehicle(null);
									}
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
							placeholder: styles.pickerPlaceholder
						}} Icon={() => {
							return isAdmin ? (<Chevron size={1.5} color={DISABLED_TEXT_COLOR}/>) : null;
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
							placeholder: styles.pickerPlaceholder,
						}} Icon={() => {
							return (<Chevron size={1.5} color={DISABLED_TEXT_COLOR}/>);
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
							placeholder: styles.pickerPlaceholder
						}} Icon={() => {
							return (<Chevron size={1.5} color={DISABLED_TEXT_COLOR}/>);
						}} useNativeAndroidPickerStyle={false}/>
					</View>

					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Observations: </Text>
						<TextInput placeholder={"Observations"} defaultValue={observations} placeholderTextColor="#A3A9AA" multiline numberOfLines={2} textAlignVertical={"top"} value={observations ? observations.toString() : ""} style={[styles.text, styles.input]} onChangeText={(value) => setObservations(value)}/>
					</View>

					{/* Add button */}
					<View style={{paddingBottom: 10}}>
						<Button text={"Add"} onPress={onAddPress}/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACKGROUND_COLOR,
		borderTopColor: ACCENT_COLOR,
		borderTopWidth: 1,
		borderStyle: "solid",
		paddingVertical: 10,
	},

	text: {
		color: TEXT_COLOR,
		fontSize: 18
	},

	pickerSelect: {
		color: TEXT_COLOR,
		fontSize: 16
	},

	disabledPicker: {
		color: DISABLED_TEXT_COLOR,
		fontSize: 16
	},

	pickerPlaceholder:{
		color: DISABLED_TEXT_COLOR,
		fontSize: 16
	},

	title: {
		fontWeight: "bold",
		paddingBottom: 10
	},

	input: {
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 5,
		borderColor: ITEM_BORDER_COLOR,
		borderStyle: "solid",
		borderWidth: 2,
		paddingVertical: 7,
		paddingHorizontal: 10,
		color: TEXT_COLOR,
		fontSize: 16,
		width: "100%",
		alignSelf: "center"
	},

	scrollView: {
		paddingHorizontal: 10,
	},

	section: {
		marginBottom: 15,
	},

	iosTimeSection: {
		marginBottom: 15,
		display: "flex",
		flexDirection: "row",
		alignItems: "center"
	},
});
