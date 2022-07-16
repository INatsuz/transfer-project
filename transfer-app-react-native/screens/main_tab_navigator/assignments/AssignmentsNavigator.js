import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Assignments from "./Assignments";
import AssignmentDetails from "../../../components/AssignmentDetails/AssignmentDetails";
import AddAssignment from "./AddAssignment";

const Stack = createNativeStackNavigator();

export default function AssignmentsNavigator(props) {
	return (
		<Stack.Navigator>
			<Stack.Screen name={"Assignments"} component={Assignments} options={{headerShown: false}}/>
			<Stack.Screen name={"AssignmentDetails"} component={AssignmentDetails} options={{
				headerBackButtonMenuEnabled: true,
				headerTitle: "Assignment Details",
				headerStyle: {
					backgroundColor: "#222222",
				},
				headerTitleStyle: {
					color: "#fff"
				},
				headerTintColor: "#fff"
			}}/>
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