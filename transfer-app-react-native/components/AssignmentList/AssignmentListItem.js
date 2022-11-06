import {StyleSheet, View, Text, TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from 'react';

function getStatusColor(status) {
	switch (status) {
		case "PENDING":
			return "#dc3545";
		case "IN PROGRESS":
			return "#28a745";
		case "FINISHED":
			return "#17a2b8";
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
		<TouchableOpacity onPress={() => props.onItemPress(props.data)}>
			<View style={[styles.listItemContainer, variableStyles.statusBorderColor]}>
				<View style={styles.listSection}>
					<Text numberOfLines={2} style={styles.textStyle}>{props.data.origin}</Text>
					<Text style={[styles.textStyle, styles.datetime]}>{dateString} {timeString}</Text>
				</View>
				<View style={[styles.listSection, {
					alignItems: "center",
					flex: 0,
					paddingHorizontal: 10
				}]}><Ionicons name="arrow-forward" size={styles.textStyle.fontSize} color={styles.textStyle.color}/></View>
				<View style={[styles.listSection]}>
					<Text numberOfLines={3} style={styles.textStyle}>{props.data.destination}</Text>
				</View>
				<View style={variableStyles.fakeBorder}></View>
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
		paddingVertical: 5,
		paddingHorizontal: 10,
		minHeight: 85,
		backgroundColor: "#181818"
	},

	listSection: {
		flex: 1,
		justifyContent: "center",
	},

	textStyle: {
		color: "#fff",
		fontSize: 16
	},

	datetime: {
		marginTop: 5,
		textAlign: "center"
	}
});