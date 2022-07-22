import {StyleSheet, TouchableOpacity, View} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import {useState} from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";

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

export default function Assignments(props) {
	const [assignments, setAssignments] = useState([]);

	const fetchAllAssignments = function () {
		return new Promise(function (resolve, reject) {
			getTokens().then(({accessToken}) => {
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
		props.navigation.navigate("AssignmentDetails", {assignment: assignment, isEditable: true})
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.plusContainer} onPress={() => props.navigation.navigate("AddAssignment")}>
				<Ionicons name="add" size={22} color={"#222222"}/>
			</TouchableOpacity>
			<View style={styles.section}>
				<AssignmentList title={"All Assignments"} assignments={assignments} fetchAssignments={fetchAllAssignments} onItemPress={navigateToDetails}/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: "#222222",
		position: "relative"
	},

	section: {
		flex: 1
	},

	plusContainer: {
		position: "absolute",
		bottom: 10,
		right: 10,
		height: 50,
		width: 50,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#AB81CD",
		borderRadius: 25,
		zIndex: 10
	}
});