import {RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import AssignmentListItem from "./AssignmentListItem";
import React, {useEffect, useState} from "react";
import {useIsFocused} from "@react-navigation/native";

export default function AssignmentList(props) {
	const [refreshing, setRefreshing] = useState(true);
	const isFocused = useIsFocused();

	useEffect(function () {
		if (isFocused) {
			setRefreshing(true);
			props.fetchAssignments().then(() => {
				setRefreshing(false);
			}).catch(err => {
				console.log(err);
			});
		}
	}, [isFocused]);


	return (
		<View style={props.roundedTop ? [styles.container, styles.roundedTop] : styles.container}>
			<Text style={styles.title}>{!props.title ? "Your Active Assignments:" : props.title}</Text>
			<ScrollView refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={() => {
					setRefreshing(true);
					props.fetchAssignments().then(() => {
						setRefreshing(false);
					});
				}}/>
			}>

				{props.assignments.length > 0 && props.assignments.map(line => {
					return (
						<AssignmentListItem data={line} key={line.ID} onItemPress={props.onItemPress}/>
					)
				})}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: "100%",
		borderColor: "#AB81CD",
		borderLeftWidth: 2,
		borderBottomWidth: 2,
		borderRightWidth: 2,
		borderStyle: "solid",
		paddingBottom: 2
	},

	roundedTop: {
		borderTopWidth: 2,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},

	title: {
		paddingHorizontal: 15,
		paddingTop: 7,
		paddingBottom: 5,
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold"
	}
});