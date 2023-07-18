import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Assignments from "./Assignments";
import AssignmentDetails from "../../../components/AssignmentDetails/AssignmentDetails";
import AddAssignment from "../../../components/AddAssignment/AddAssignment";
import {StyleSheet} from "react-native";
import {putWithAuth} from "../../../utils/Requester";
import StatusMenu from "../../../components/StatusMenu/StatusMenu";
import {BACKGROUND_COLOR, TEXT_COLOR} from "../../../utils/Colors";

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

export default function AssignmentsNavigator() {
	return (
		<Stack.Navigator>
			<Stack.Screen name={"Assignments"} component={Assignments} options={{headerShown: false}}/>
			<Stack.Screen name={"AssignmentDetails"} component={AssignmentDetails} options={({navigation, route}) => ({
				headerBackButtonMenuEnabled: true,
				headerTitle: "Transfer Details",
				headerStyle: {
					backgroundColor: BACKGROUND_COLOR,
				},
				headerTitleStyle: {
					color: TEXT_COLOR
				},
				headerTintColor: TEXT_COLOR,
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
					backgroundColor: BACKGROUND_COLOR,
				},
				headerTitleStyle: {
					color: TEXT_COLOR
				},
				headerTintColor: TEXT_COLOR
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