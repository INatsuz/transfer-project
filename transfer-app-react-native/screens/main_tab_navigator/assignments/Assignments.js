import {StyleSheet, View} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import {useState} from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

const IP = "81.84.159.96";

async function getTokens() {
	let accessToken = await SecureStore.getItemAsync("accessToken");
	let refreshToken = await SecureStore.getItemAsync("refreshToken");

	if (accessToken && refreshToken) {
		return {accessToken: accessToken, refreshToken: refreshToken};
	} else {
		return false;
	}
}

const Stack = createNativeStackNavigator();


export default function Assignments(props) {
	const [assignments, setAssignments] = useState([]);

	const fetchAllAssignments = function () {
		return new Promise(function (resolve, reject) {
			getTokens().then(({accessToken, refreshToken}) => {
				axios.get(`http://${IP}:3000/api/getAllAssignments`, {
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				}).then(res => {
					setAssignments(res.data);
					resolve()
				}).catch(err => {
					console.log("Could not get transfers");
					console.log(err);
					reject();
				});
			});
		});
	}

	const navigateToDetails = function (assignment) {
		console.log("Navigate to Details");
		props.navigation.navigate("AssignmentDetails", {assignment: assignment, isEditable: true})
	};

	return (
		<View style={styles.container}>
			<View style={styles.section}>
				<AssignmentList title={"All Assignments"} assignments={assignments} fetchAssignments={fetchAllAssignments} onItemPress={navigateToDetails}/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: "#222222"
	},

	section: {
		flex: 1
	},
});