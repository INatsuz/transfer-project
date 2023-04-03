import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AssignmentDetails from "../../../components/AssignmentDetails/AssignmentDetails";
import Home from "./Home";
import {StyleSheet, Text, View} from "react-native";
import {Menu, MenuItem} from "react-native-material-menu";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {useState} from "react";
import {putWithAuth} from "../../../utils/Requester";
import AddAssignment from "../../../components/AddAssignment/AddAssignment";
import getStatusColor from "../../../utils/StatusColor";
import StatusMenu from "../../../components/StatusMenu/StatusMenu";

const Stack = createNativeStackNavigator();

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

export default function HomeNavigator() {
	const [isMenuVisible, setIsMenuVisible] = useState(false);

	return (
		<Stack.Navigator>
			<Stack.Screen name={"Home"} component={Home} options={{headerShown: false}}/>
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
		fontSize: 15,
		fontWeight: "500"
	}
});