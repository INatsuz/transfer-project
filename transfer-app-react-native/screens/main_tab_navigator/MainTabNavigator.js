import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import {StyleSheet, View} from "react-native";
import {useSelector} from "react-redux";
import AssignmentsNavigator from "./assignments/AssignmentsNavigator";
import HomeNavigator from "./home/HomeNavigator";
import {StatusBar} from "expo-status-bar";
import React from "react";
import {
	ACCENT_COLOR,
	BACKGROUND_COLOR,
	INACTIVE_TAB_ICON_COLOR,
	ITEM_BORDER_COLOR,
	TEXT_COLOR
} from "../../utils/Colors";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
	const userType = useSelector(state => state.login.userType);

	return (
		<View style={styles.container}>
			<StatusBar backgroundColor={BACKGROUND_COLOR} translucent={true}/>
			<Tab.Navigator screenOptions={{
				tabBarActiveTintColor: TEXT_COLOR,
				tabBarInactiveTintColor: INACTIVE_TAB_ICON_COLOR,
				tabBarStyle: {
					backgroundColor: ACCENT_COLOR,
					borderTopColor: ACCENT_COLOR,
				},
			}}>

				<Tab.Screen name={"HomeNavigator"} component={HomeNavigator} options={{
					headerShown: false,
					title: "Home",
					tabBarIcon: ({color, size}) => (
						<Ionicons name="home" size={size} color={color}/>
					)
				}}/>
				{/*{*/}
				{/*	userType === 1 &&*/}
				{/*	<Tab.Screen name={"AssignmentsNavigator"} component={AssignmentsNavigator} options={{*/}
				{/*		headerShown: false,*/}
				{/*		tabBarIcon: ({color, size}) => (*/}
				{/*			<Ionicons name="car" size={size} color={color}/>*/}
				{/*		),*/}
				{/*		title: "Assignments"*/}
				{/*	}}/>*/}
				{/*}*/}
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