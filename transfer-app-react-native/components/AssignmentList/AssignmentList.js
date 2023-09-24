import {FlatList, Pressable, SafeAreaView, StyleSheet, Text, View} from "react-native";
import AssignmentListItem from "./AssignmentListItem";
import React, {useEffect, useState} from "react";
import {useIsFocused, useNavigation} from "@react-navigation/native";
import {useSelector} from "react-redux";
import "../../utils/Colors"
import Ionicons from "@expo/vector-icons/Ionicons";
import SearchModal from "../SearchModal/SearchModal";
import {ACCENT_COLOR, TEXT_COLOR} from "../../utils/Colors";
import CalendarSearchModal from "../CalendarSearchModal/CalendarSearchModal";

export default function AssignmentList(props) {
	const [refreshing, setRefreshing] = useState(true);
	const isFocused = useIsFocused();
	const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
	const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);

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
			<CalendarSearchModal isVisible={isCalendarModalVisible} setIsVisible={setIsCalendarModalVisible}/>

			<View style={styles.titleContainer}>
				<Text style={styles.title}>{!props.title ? "Your Assignments:" : props.title}</Text>
				<View style={styles.iconContainer}>
					{

						props.isCalendarButtonVisible &&
						<Pressable onPress={() => setIsCalendarModalVisible(true)}>
							<Ionicons name={"calendar"} color={"white"} size={22}/>
						</Pressable>
					}
					{
						props.isSearchButtonVisible &&
						<Pressable style={styles.searchButton} onPress={() => setIsSearchModalVisible(true)}>
							<Ionicons name={"search"} color={TEXT_COLOR} size={22}/>
						</Pressable>
					}
				</View>
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
				ListFooterComponent={() => <View style={{height: 65}}></View>}
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
		borderBottomColor: ACCENT_COLOR,
		borderBottomWidth: 2,
		borderStyle: "solid",
		marginBottom: 10,
		paddingHorizontal: 15,
		paddingTop: 7,
		paddingBottom: 10,
	},

	iconContainer: {
		display: "flex",
		flexDirection: "row",
	},

	searchButton: {
		marginStart: 10
	},

	title: {
		color: TEXT_COLOR,
		fontSize: 20,
		fontWeight: "bold",
	}
});