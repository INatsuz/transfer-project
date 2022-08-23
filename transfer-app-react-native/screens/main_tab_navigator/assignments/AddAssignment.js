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
import {useState} from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";
import {Chevron} from "react-native-shapes";
import useOperators from "../../../hooks/useOperators";
import {postWithAuth} from "../../../utils/Requester";

export default function AddAssignment(props) {
	const [pickingDate, setPickingDate] = useState(false);
	const [pickingTime, setPickingTime] = useState(false);

	const [personName, setPersonName] = useState("");
	const [numberOfPeople, setNumberOfPeople] = useState(1);
	const [price, setPrice] = useState("");
	const [origin, setOrigin] = useState("");
	const [destination, setDestination] = useState("");
	const [date, setDate] = useState(new Date());
	const [time, setTime] = useState(new Date());
	const [flight, setFlight] = useState("");
	const [operator, setOperator] = useState(null);
	const [observations, setObservations] = useState("");

	const [operators] = useOperators();

	let dateString = String(date.getDate()).padStart(2, "0") + "/" + String(date.getMonth() + 1).padStart(2, "0") + "/" + date.getFullYear();
	let timeString = String(time.getHours()).padStart(2, "0") + ":" + String(time.getMinutes()).padStart(2, "0");

	function onAddPress() {
		let data = {
			person_name: personName,
			num_of_people: numberOfPeople,
			price,
			origin,
			destination,
			flight,
			datetime: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${time.getUTCHours()}:${time.getUTCMinutes()}:00`,
			operator,
			observations
		};
		console.log(data)

		postWithAuth("api/addTransfer", data).then(res => {
			console.log("Transfer added successfully");
			props.navigation.navigate("Assignments");
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
			{pickingTime && <DateTimePicker value={time} mode="time" onChange={(event, time) => {
				setPickingTime(false);
				setTime(time);
			}}/>}

			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{flex: 1}}>
				<ScrollView style={styles.scrollView}>
					{/* Person Name field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Person Name: </Text>
						<TextInput placeholder={"Person Name"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPersonName(value)}/>
					</View>

					{/* Number of People field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Number of People: </Text>
						<TextInput keyboardType={"number-pad"} placeholder={"Number of People"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setNumberOfPeople(value)}/>
					</View>

					{/* Price field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Price: </Text>
						<TextInput keyboardType={"number-pad"} placeholder={"Price"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPrice(value)}/>
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

					{/* Flight field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Flight: </Text>
						<TextInput placeholder={"Flight"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setFlight(value)}/>
					</View>

					{/* Time/Date field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Time: </Text>
						<Pressable onPress={() => {
							if (!pickingDate && !pickingTime) setPickingDate(true);
						}}>
							<TextInput editable={false} value={dateString + " - " + timeString} style={[styles.text, styles.input]}/>
						</Pressable>
					</View>

					{/* Operators field */}
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Operator: </Text>
						<RNPickerSelect value={operator} items={operators.map(item => {
							return {key: item.ID, label: item.name, value: item.ID};
						})} onValueChange={(value) => {
							if (value !== operator) {
								console.log(value);
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