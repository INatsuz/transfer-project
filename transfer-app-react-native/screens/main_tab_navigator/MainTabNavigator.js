import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import Home from "../home/Home";
import {useState} from "react";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator(props) {
	const [tripNumber, setTripNumber] = useState(1);

	return (
		<Tab.Navigator>
			<Tab.Screen name={"Home"} component={Home} options={{
				headerShown: false, tabBarIcon: ({color, size}) => (
					<Ionicons name="home" size={size} color={color}/>
				)
			}}/>
			<Tab.Screen name={"Assignments"} component={Home} options={{
				headerShown: false, tabBarBadge: (tripNumber > 0 ? tripNumber : undefined), tabBarIcon: ({color, size}) => (
					<Ionicons name="car" size={size} color={color} />
				)
			}}/>
		</Tab.Navigator>
	);
};