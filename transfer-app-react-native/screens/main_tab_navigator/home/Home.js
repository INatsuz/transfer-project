import {StyleSheet, TouchableOpacity, View, Text} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import ProfileSection from "../../../components/ProfileSection/ProfileSection";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {getWithAuth} from "../../../utils/Requester";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Home(props) {
	const userID = useSelector(state => state.login.userID);
	const email = useSelector(state => state.login.email);
	const name = useSelector(state => state.login.name);
	const userType = useSelector(state => state.login.userType);
	const [selectedTab, setSelectedTab] = useState(1);
	const [assignments, setAssignments] = useState([]);

	function filterAssignments() {
		let targetDate = new Date();
		switch (selectedTab) {
			case 0:
				targetDate.setDate(targetDate.getDate() - 1);
				break;
			case 2:
				targetDate.setDate(targetDate.getDate() + 1);
		}

		return assignments.filter(assignment => {
			let assignmentDate = new Date(assignment.transfer_time);
			return assignmentDate.getDate() === targetDate.getDate() && assignmentDate.getMonth() === targetDate.getMonth() && assignmentDate.getFullYear() === targetDate.getFullYear();
		})
	}

	async function fetchAssignments() {
		return new Promise(function (resolve, reject) {
			let today = new Date();
			today.setHours(0, 0, 0, 0);
			let yesterday = new Date(today.getTime());
			yesterday.setDate(yesterday.getDate() - 1)
			let day_after_tomorrow = new Date(today.getTime());
			day_after_tomorrow.setDate(day_after_tomorrow.getDate() + 2);

			getWithAuth(`api/getAssignedTransfers?startDate=${yesterday.toISOString()}&endDate=${day_after_tomorrow.toISOString()}`).then(res => {
				setAssignments(res.data.transfers);
				resolve();
			}).catch(err => {
				console.log("Could not get assigned transfers");
				console.log(err);
				reject();
			});
		});
	}

	const navigateToDetails = function (assignment) {
		props.navigation.navigate("AssignmentDetails", {assignment: assignment, isAdmin: false})
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.plusContainer} onPress={() => props.navigation.navigate("AddAssignment", {isAdmin: false, userID: userID})}>
				<Ionicons name="add" size={22} color={"#222222"}/>
			</TouchableOpacity>
			<View>
				<ProfileSection assignmentCount={assignments.length} userData={{
					userType: userType,
					name: name,
					email: email
				}} navigation={props.navigation}/>
			</View>
			<View style={styles.tabs}>
				<TouchableOpacity style={selectedTab === 0 ? [styles.tab, styles.selected] : styles.tab} onPress={() => setSelectedTab(0)}>
					<Text style={styles.tabText}>Yesterday</Text>
				</TouchableOpacity>
				<TouchableOpacity style={selectedTab === 1 ? [styles.tab, styles.selected] : styles.tab} onPress={() => setSelectedTab(1)}>
					<Text style={styles.tabText}>Today</Text>
				</TouchableOpacity>
				<TouchableOpacity style={selectedTab === 2 ? [styles.tab, styles.tabLast, styles.selected] : [styles.tab, styles.tabLast]} onPress={(event) => {
					setSelectedTab(2);
				}}>
					<Text style={styles.tabText}>Tomorrow</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.section}>
				<AssignmentList assignments={filterAssignments()} fetchAssignments={fetchAssignments} onItemPress={navigateToDetails}/>
			</View>
		</View>
	)
};

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: "#222222"
	},

	section: {
		flex: 1
	},

	tabs: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-evenly",
		backgroundColor: "#AB81CD",
		padding: 0
	},

	tab: {
		flexGrow: 1,
		borderColor: "#222222",
		borderEndWidth: 1,
		paddingTop: 5,
		paddingBottom: 5
	},

	tabLast: {
		borderEndWidth: 0,
	},

	tabText: {
		textAlign: "center",
		color: "white"
	},

	selected: {
		backgroundColor: "#935CBF"
	},

	plusContainer: {
		position: "absolute",
		bottom: 10,
		right: 10,
		height: 50,
		width: 50,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#AB81CD",
		borderRadius: 25,
		zIndex: 10
	}
});