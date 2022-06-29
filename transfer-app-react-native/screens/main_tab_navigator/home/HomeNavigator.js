import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AssignmentDetails from "../../../components/AssignmentDetails/AssignmentDetails";
import Assignments from "../assignments/Assignments";
import Home from "./Home";

const Stack = createNativeStackNavigator();

export default function HomeNavigator(props) {
	return (
		<Stack.Navigator>
			<Stack.Screen name={"Home"} component={Home} options={{headerShown: false}}/>
			<Stack.Screen name={"AssignmentDetails"} component={AssignmentDetails} options={
				{
					headerBackButtonMenuEnabled: true,
					headerTitle: "Assignment Details",
					headerStyle: {
						backgroundColor: "#222222",
					},
					headerTitleStyle: {
						color: "#fff"
					},
					headerTintColor: "#fff"
				}
			}/>
		</Stack.Navigator>
	);
};