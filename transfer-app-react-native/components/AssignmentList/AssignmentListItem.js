import {StyleSheet, View, Text, TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function AssignmentListItem(props) {

	return (
		<TouchableOpacity style={styles.listItemContainer} onPress={() => props.onItemPress(props.data)}>
			<View style={styles.listSection}><Text style={styles.textStyle}>{props.data.origin}</Text></View>
			<View style={[styles.listSection, {alignItems: "center", flex:0, paddingHorizontal: 10}]}><Ionicons name="arrow-forward" size={styles.textStyle.fontSize} color={styles.textStyle.color}/></View>
			<View style={styles.listSection}><Text style={styles.textStyle}>{props.data.destination}</Text></View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	listItemContainer: {
		flexDirection: "row",
		borderRadius: 10,
		marginVertical: 5,
		marginHorizontal: 10,
		padding: 5,
		minHeight: 85,
		backgroundColor: "#181818"
	},

	listSection: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},

	textStyle: {
		color: "#fff",
		fontSize: 16
	}
});