import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import {StyleSheet, View} from "react-native";
import {useSelector} from "react-redux";
import AssignmentsNavigator from "./assignments/AssignmentsNavigator";
import HomeNavigator from "./home/HomeNavigator";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
	const userType = useSelector(state => state.login.userType);

	return (
		<View style={styles.container}>
			<Tab.Navigator screenOptions={{
				tabBarActiveTintColor: '#fff',
				tabBarInactiveTintColor: '#c8c8c8',
				tabBarStyle: {
					backgroundColor: '#5F9EA0',
					borderTopColor: '#5F9EA0',
				},
			}}>

				<Tab.Screen name={"HomeNavigator"} component={HomeNavigator} options={{
					headerShown: false,
					title: "Home",
					tabBarIcon: ({color, size}) => (
						<Ionicons name="home" size={size} color={color}/>
					)
				}}/>
				{
					userType === 1 &&
					<Tab.Screen name={"AssignmentsNavigator"} component={AssignmentsNavigator} options={{
						headerShown: false,
						tabBarIcon: ({color, size}) => (
							<Ionicons name="car" size={size} color={color}/>
						),
						title: "Assignments"
					}}/>
				}
			</Tab.Navigator>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		minHeight: "100%",
		backgroundColor: "#222222"
	},
});