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
import {useEffect, useState} from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

export default function AddAssignment(props) {
	const [pickingDate, setPickingDate] = useState(false);
	const [pickingTime, setPickingTime] = useState(false);

	const [personName, setPersonName] = useState("");
	const [numberOfPeople, setNumberOfPeople] = useState(1);
	const [origin, setOrigin] = useState("");
	const [destination, setDestination] = useState("");
	const [date, setDate] = useState(new Date());
	const [time, setTime] = useState(new Date());

	// const [driverList, setDriverList] = useState([]);

	let dateString = String(date.getDate()).padStart(2, "0") + "/" + String(date.getMonth() + 1).padStart(2, "0") + "/" + date.getFullYear();
	let timeString = String(time.getHours()).padStart(2, "0") + ":" + String(time.getMinutes()).padStart(2, "0");

	function onAddPress() {
		getTokens().then(({accessToken, refreshToken}) => {
			axios.post(`http://${IP}:3000/api/addTransfer`, {
				person_name: personName,
				num_of_people: numberOfPeople,
				origin: origin,
				destination: destination,
				datetime: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${time.getUTCHours()}:${time.getUTCMinutes()}:00`
			}, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then(res => {
				console.log(res.data);
				props.navigation.navigate("Assignments");
			}).catch(err => {
				console.log(err.response);
			});
		});
	}
	//
	// function fetchDrivers() {
	// 	getTokens().then(({accessToken, refreshToken}) => {
	// 		axios.get(`http://${IP}:3000/api/getDrivers`, {
	// 			headers: {
	// 				Authorization: `Bearer ${accessToken}`
	// 			}
	// 		}).then(res => {
	// 			console.log(res.data);
	// 			setDriverList(res.data.drivers);
	// 		}).catch(err => {
	// 			console.log(err.response);
	// 		});
	// 	});
	// }
	//
	// useEffect(() => {
	// 	fetchDrivers();
	// }, []);

	return (
		<View style={styles.container}>
			{pickingDate && <DateTimePicker value={date} mode="date" onChange={(event, date) => {
				setPickingDate(false);
				setDate(date);
				setPickingTime(true);
			}}/>}
			{pickingTime && <DateTimePicker value={time} mode="time" onChange={(event, time) => {
				setPickingTime(false);
				setTime(time);
			}}/>}
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
				<ScrollView style={styles.scrollView}>
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Person Name: </Text>
						<TextInput placeholder={"Person Name"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setPersonName(value)}/>
					</View>
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Number of People: </Text>
						<TextInput keyboardType={"number-pad"} placeholder={"Number of People"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setNumberOfPeople(value)}/>
					</View>
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Origin: </Text>
						<TextInput placeholder={"Origin"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setOrigin(value)}/>
					</View>
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Destination: </Text>
						<TextInput placeholder={"Destination"} placeholderTextColor="#A3A9AA" style={[styles.textStyle, styles.input]} onChangeText={(value) => setDestination(value)}/>
					</View>
					<View style={styles.section}>
						<Text style={[styles.text, styles.title]}>Time: </Text>
						<Pressable onPress={() => {
							if (!pickingDate && !pickingTime) setPickingDate(true);
						}}>
							<TextInput editable={false} value={dateString + " - " + timeString} style={[styles.text, styles.input]}/>
						</Pressable>
					</View>
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