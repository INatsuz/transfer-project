import {StyleSheet, View} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import ProfileSection from "../../../components/ProfileSection/ProfileSection";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {getWithAuth} from "../../../utils/Requester";

export default function Home(props) {
	const email = useSelector(state => state.login.email);
	const name = useSelector(state => state.login.name);
	const userType = useSelector(state => state.login.userType);

	const [assignments, setAssignments] = useState([]);

	async function fetchAssignments() {
		return new Promise(function (resolve, reject) {
			getWithAuth("api/getAssignedTransfers").then(res => {
				setAssignments(res.data.transfers);
				resolve()
			}).catch(err => {
				console.log("Could not get assigned transfers");
				console.log(err);
				reject();
			});
		});
	}

	const navigateToDetails = function (assignment) {
		props.navigation.navigate("AssignmentDetails", {assignment: assignment})
	};

	return (
		<View style={styles.container}>
			<View>
				<ProfileSection assignmentCount={assignments.length} userData={{
					userType: userType,
					name: name,
					email: email
				}} navigation={props.navigation}/>
			</View>
			<View style={styles.section}>
				<AssignmentList assignments={assignments} fetchAssignments={fetchAssignments} onItemPress={navigateToDetails}/>
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
});