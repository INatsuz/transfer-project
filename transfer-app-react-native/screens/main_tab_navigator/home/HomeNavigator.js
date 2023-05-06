import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AssignmentDetails from "../../../components/AssignmentDetails/AssignmentDetails";
import Home from "./Home";
import {putWithAuth} from "../../../utils/Requester";
import AddAssignment from "../../../components/AddAssignment/AddAssignment";
import StatusMenu from "../../../components/StatusMenu/StatusMenu";
import SearchResults from "./SearchResults";

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
			<Stack.Screen name={"SearchResults"} component={SearchResults} options={{
				headerBackButtonMenuEnabled: true,
				headerTitle: "Search Results",
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