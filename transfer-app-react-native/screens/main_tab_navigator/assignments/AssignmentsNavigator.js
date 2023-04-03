import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Assignments from "./Assignments";
import AssignmentDetails from "../../../components/AssignmentDetails/AssignmentDetails";
import AddAssignment from "../../../components/AddAssignment/AddAssignment";
import {StyleSheet, Text, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Menu, MenuItem} from 'react-native-material-menu';
import React, {useState} from "react";
import {putWithAuth} from "../../../utils/Requester";
import StatusMenu from "../../../components/StatusMenu/StatusMenu";

const Stack = createNativeStackNavigator();

function getStatusColor(status) {
	switch (status) {
		case "PENDING":
			return "#FFC107";
		case "IN PROGRESS":
			return "#28a745";
		case "FINISHED":
			return "#6C757D";
	}
}

function onMenuItemPress(navigation, route, value) {
	let assignment = {...route.params.assignment}; // TODO Remove ... to update the list as well
	assignment.status = value;

	putWithAuth("api/updateTransferStatus", {
		ID: assignment.ID,
		status: value
	}).then(() => {
		console.log("Status updated to " + value);
	}).catch(err => {
		console.log(err);
		console.log("Couldn't update transfer status");
	});

	navigation.setParams({assignment: assignment});
}

export default function AssignmentsNavigator() {
	const [isMenuVisible, setIsMenuVisible] = useState(false);

	return (
		<Stack.Navigator>
			<Stack.Screen name={"Assignments"} component={Assignments} options={{headerShown: false}}/>
			<Stack.Screen name={"AssignmentDetails"} component={AssignmentDetails} options={({navigation, route}) => ({
				headerBackButtonMenuEnabled: true,
				headerTitle: "Transfer Details",
				headerStyle: {
					backgroundColor: "#222222",
				},
				headerTitleStyle: {
					color: "#fff"
				},
				headerTintColor: "#fff",
				headerRight: () => {
					return (
						<StatusMenu navigation={navigation} route={route} onMenuItemPress={onMenuItemPress}/>
					)
				}
			})}/>
			<Stack.Screen name={"AddAssignment"} component={AddAssignment} options={{
				headerBackButtonMenuEnabled: true,
				headerTitle: "Add Assignment",
				headerStyle: {
					backgroundColor: "#222222",
				},
				headerTitleStyle: {
					color: "#fff"
				},
				headerTintColor: "#fff"
			}}/>
		</Stack.Navigator>
	);
};

const styles = StyleSheet.create({
	icon: {
		fontSize: 40
	},

	menuText: {
		color: "white",
		fontSize: 15,
		fontWeight: "500"
	}
});