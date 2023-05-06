import {FlatList, Pressable, SafeAreaView, StyleSheet, Text, View} from "react-native";
import AssignmentListItem from "./AssignmentListItem";
import React, {useEffect, useState} from "react";
import {useIsFocused, useNavigation} from "@react-navigation/native";
import {useSelector} from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import SearchModal from "../SearchModal/SearchModal";

export default function AssignmentList(props) {
	const [refreshing, setRefreshing] = useState(true);
	const isFocused = useIsFocused();
	const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

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
			<SearchModal isVisible={isSearchModalVisible} setIsVisible={setIsSearchModalVisible}/>

			<View style={styles.titleContainer}>
				<Text style={styles.title}>{!props.title ? "Your Active Assignments:" : props.title}</Text>
				{
				props.isSearchButtonVisible &&
				<Pressable onPress={() => setIsSearchModalVisible(true)}>
					<Ionicons name={"search"} color={"white"} size={22}/>
				</Pressable>
				}
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
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomColor: "#AB81CD",
		borderBottomWidth: 2,
		borderStyle: "solid",
		marginBottom: 10,
		paddingHorizontal: 15,
		paddingTop: 7,
		paddingBottom: 10,
	},

	title: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
	}
});