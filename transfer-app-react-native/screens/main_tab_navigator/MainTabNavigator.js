import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import {Platform, SafeAreaView, StatusBar, StyleSheet} from "react-native";
import {useSelector} from "react-redux";
import AssignmentsNavigator from "./assignments/AssignmentsNavigator";
import HomeNavigator from "./home/HomeNavigator";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
	const userType = useSelector(state => state.login.userType);

	return (
		<SafeAreaView style={styles.container}>
			<Tab.Navigator screenOptions={{
				tabBarActiveTintColor: '#fff',
				tabBarInactiveTintColor: 'lightgray',
				tabBarActiveBackgroundColor: '#AB81CD',
				tabBarInactiveBackgroundColor: '#B18BD1',
				tabBarStyle: {
					backgroundColor: '#AB81CD',
					borderTopColor: '#AB81CD'
				}
			}}>

				<Tab.Screen name={"Home Navigator"} component={HomeNavigator} options={{
					headerShown: false,
					unmountOnBlur: true,
					title: "Home",
					tabBarIcon: ({color, size}) => (
						<Ionicons name="home" size={size} color={color}/>
					)
				}}/>
				{
					userType === 1 &&
					<Tab.Screen name={"AssignmentsNavigator"} component={AssignmentsNavigator} options={{
						headerShown: false,
						unmountOnBlur: true,
						tabBarIcon: ({color, size}) => (
							<Ionicons name="car" size={size} color={color}/>
						),
						title: "Assignments"
					}}/>
				}
			</Tab.Navigator>
		</SafeAreaView>
	);
};

const statusBarHeight = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

const styles = StyleSheet.create({
	container: {
		paddingTop: statusBarHeight,
		minHeight: "100%",
		backgroundColor: "#222222"
	},
});