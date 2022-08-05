import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AssignmentDetails from "../../../components/AssignmentDetails/AssignmentDetails";
import Home from "./Home";
import {StyleSheet, Text, View} from "react-native";
import {Menu, MenuItem} from "react-native-material-menu";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useState} from "react";
import {putWithAuth} from "../../../utils/Requester";

const Stack = createNativeStackNavigator();

function getStatusColor(status) {
	switch (status) {
		case "PENDING":
			return "#FFD700";
		case "IN PROGRESS":
			return "#28a745";
		case "FINISHED":
			return "#17a2b8";
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
						<View>
							<Menu
								style={{padding: 0}}
								visible={isMenuVisible}
								anchor={
									<Text onPress={() => setIsMenuVisible(true)}>
										<Ionicons name={"chevron-down-circle"} size={40} color={getStatusColor(route.params.assignment.status)}/>
									</Text>
								}
								onRequestClose={() => setIsMenuVisible(false)}
							>
								<MenuItem
									onPress={
										() => {
											setIsMenuVisible(false);
											onMenuItemPress(navigation, route, "PENDING");
										}
									}
									style={{minWidth: 150}}>
									<View style={{display: "flex", flexDirection: "row"}}>
										<Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("PENDING")}/>
										<View style={{justifyContent: "center"}}><Text style={styles.menuText}>Pending</Text></View>
									</View>
								</MenuItem>
								<MenuItem
									onPress={
										() => {
											setIsMenuVisible(false);
											onMenuItemPress(navigation, route, "IN PROGRESS");
										}
									}
									style={{minWidth: 150}}>
									<View style={{display: "flex", flexDirection: "row"}}>
										<Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("IN PROGRESS")}/>
										<View style={{justifyContent: "center"}}><Text style={styles.menuText}>Progress</Text></View>
									</View>
								</MenuItem>
								<MenuItem
									onPress={
										() => {
											setIsMenuVisible(false);
											onMenuItemPress(navigation, route, "FINISHED");
										}
									}
									style={{minWidth: 150}}>
									<View style={{display: "flex", flexDirection: "row"}}>
										<Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("FINISHED")}/>
										<View style={{justifyContent: "center"}}><Text style={styles.menuText}>Finished</Text></View>
									</View>
								</MenuItem>
							</Menu>
						</View>
					)
				}
			})}/>
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