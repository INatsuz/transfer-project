import {Platform, StatusBar, StyleSheet, TouchableOpacity, View} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import {useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {getWithAuth} from "../../../utils/Requester";

export default function Assignments(props) {
	const [assignments, setAssignments] = useState([]);

	const fetchAllAssignments = function () {
		return new Promise(function (resolve, reject) {
			getWithAuth("api/getAllTransfers").then(res => {
				setAssignments(res.data.transfers);
				resolve()
			}).catch(err => {
				console.log("Could not get transfers");
				console.log(err);
				reject();
			});
		});
	}

	const navigateToDetails = function (assignment) {
		props.navigation.navigate("AssignmentDetails", {assignment: assignment, isAdmin: true})
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.plusContainer} onPress={() => props.navigation.navigate("AddAssignment", {isAdmin: true})}>
				<Ionicons name="add" size={22} color={"white"}/>
			</TouchableOpacity>
			<View style={styles.section}>
				<AssignmentList title={"All Assignments"} assignments={assignments} fetchAssignments={fetchAllAssignments} onItemPress={navigateToDetails} roundedTop={true}/>
			</View>
		</View>
	);
};

const statusBarHeight = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

const styles = StyleSheet.create({
	container: {
		paddingTop: statusBarHeight,
		height: "100%",
		backgroundColor: "#222222",
		position: "relative",
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