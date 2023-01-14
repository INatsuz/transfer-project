import {StyleSheet, View, Text, TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from 'react';

function getStatusColor(status) {
	switch (status) {
		case "PENDING":
			return "#FFC107";
		case "IN PROGRESS":
			return "#28a745";
		case "FINISHED":
			return "#6C757D";
	}
}

export default function AssignmentListItem(props) {
	let datetime = new Date(props.data.transfer_time);
	const dateString = String(datetime.getDate()).padStart(2, "0") + "/" + String(datetime.getMonth() + 1).padStart(2, "0") + "/" + datetime.getFullYear();
	const timeString = String(datetime.getHours()).padStart(2, "0") + ":" + String(datetime.getMinutes()).padStart(2, "0");

	let variableStyles = StyleSheet.create({
			statusBorderColor: {
				borderRightColor: getStatusColor(props.data.status)
			}
		}
	);

	return (
		<TouchableOpacity delayPressIn={20} onPress={() => props.onItemPress(props.data)}>
			<View style={[styles.listItemContainer, variableStyles.statusBorderColor]}>
				<View style={styles.itemColumn}>
					<View style={styles.topItemField}>
						<Text style={styles.textStyle}>Date/Time:</Text>
						<Text style={styles.textStyle}>{dateString} {timeString}</Text>
					</View>
					<View>
						<Text style={styles.textStyle}>Origin:</Text>
						<Text style={styles.textStyle}>{props.data.origin}</Text>
					</View>
				</View>
				<View style={styles.itemColumn}>
					<View style={styles.topItemField}>
						<Text style={styles.textStyle}>Person:</Text>
						<Text style={styles.textStyle}>{props.data.person_name}</Text>
					</View>
					<View>
						<Text style={styles.textStyle}>Destination:</Text>
						<Text style={styles.textStyle}>{props.data.destination}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	listItemContainer: {
		overflow: "hidden",
		flexDirection: "row",
		borderRadius: 10,
		borderRightWidth: 4,
		marginVertical: 5,
		marginHorizontal: 10,
		paddingVertical: 10,
		paddingHorizontal: 10,
		minHeight: 85,
		backgroundColor: "#181818"
	},

	itemColumn: {
		width: "50%",
		height: "100%"
	},

	topItemField: {
		marginBottom: 10
	},

	textStyle: {
		color: "#fff",
		fontSize: 14
	}
});