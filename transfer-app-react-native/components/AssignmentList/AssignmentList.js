import {FlatList, SafeAreaView, StyleSheet, Text, View} from "react-native";
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
		<SafeAreaView style={props.roundedTop ? [styles.container, styles.roundedTop] : styles.container}>
			<View style={styles.titleContainer}>
				<Text style={styles.title}>{!props.title ? "Your Active Assignments:" : props.title}</Text>
			</View>
			<FlatList
				data={props.assignments}
				renderItem={({item}) => <AssignmentListItem key={item.id} data={item} onItemPress={props.onItemPress}/>}
				refreshing={refreshing}
				onRefresh={() => {
					setRefreshing(true);
					props.fetchAssignments().then(() => {
						setRefreshing(false);
					});
				}}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		height: "100%",
		paddingBottom: 2
	},

	titleContainer: {
		borderBottomColor: "#AB81CD",
		borderBottomWidth: 2,
		borderStyle: "solid"
	},

	title: {
		paddingHorizontal: 15,
		paddingTop: 7,
		paddingBottom: 10,
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
	}
});