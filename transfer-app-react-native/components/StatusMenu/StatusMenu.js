import {StyleSheet, View, Text} from "react-native";
import {Menu, MenuOption, MenuOptions, MenuTrigger} from "react-native-popup-menu";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import getStatusColor from "../../utils/StatusColor";
import {BACKGROUND_COLOR, TEXT_COLOR} from "../../utils/Colors";

export default function StatusMenu(props) {
	return (
		<Menu>
			<MenuTrigger>
				<Ionicons name={"chevron-down-circle"} size={40} color={getStatusColor(props.route.params.assignment.status)}/>
			</MenuTrigger>
			<MenuOptions optionsContainerStyle={styles.menuOptions}>
				<MenuOption style={styles.menuOption} onSelect={() => props.onMenuItemPress(props.navigation, props.route, "PENDING")}>
					<Text><Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("PENDING")}/></Text>
					<Text style={styles.menuOptionText}>Pending</Text>
				</MenuOption>
				<MenuOption style={styles.menuOption} onSelect={() => props.onMenuItemPress(props.navigation, props.route, "IN PROGRESS")}>
					<Text><Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("IN PROGRESS")}/></Text>
					<Text style={styles.menuOptionText}>In Progress</Text>
				</MenuOption>
				<MenuOption style={styles.menuOption} onSelect={() => props.onMenuItemPress(props.navigation, props.route, "FINISHED")}>
					<Text><Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("FINISHED")}/></Text>
					<Text style={styles.menuOptionText}>Finished</Text>
				</MenuOption>
				<MenuOption style={styles.menuOption} onSelect={() => props.onMenuItemPress(props.navigation, props.route, "CONFIRMED")}>
					<Text><Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("CONFIRMED")}/></Text>
					<Text style={styles.menuOptionText}>Confirmed</Text>
				</MenuOption>
				<MenuOption style={styles.menuOption} onSelect={() => props.onMenuItemPress(props.navigation, props.route, "OUTSOURCE")}>
					<Text><Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("OUTSOURCE")}/></Text>
					<Text style={styles.menuOptionText}>Outsource</Text>
				</MenuOption>
				<MenuOption style={styles.menuOption} onSelect={() => props.onMenuItemPress(props.navigation, props.route, "BUS")}>
					<Text><Ionicons name={"ellipse"} size={styles.icon.fontSize} color={getStatusColor("BUS")}/></Text>
					<Text style={styles.menuOptionText}>BUS</Text>
				</MenuOption>
			</MenuOptions>
		</Menu>
	);
};

const styles = StyleSheet.create({
	menuOptions: {
		width: "auto",
		backgroundColor: BACKGROUND_COLOR
	},

	menuOption: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
	},

	menuOptionText: {
		marginLeft: 10,
		fontSize: 16,
		fontWeight: "bold",
		color: TEXT_COLOR
	},

	icon: {
		fontSize: 40
	}
});
