import {StyleSheet, View} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import {getWithAuth} from "../../../utils/Requester";
import {useState} from "react";
import {useSelector} from "react-redux";
import {BACKGROUND_COLOR} from "../../../utils/Colors";

export default function SearchResults({route, navigation}) {
	let [assignments, setAssignments] = useState();
	const userType = useSelector(state => state.login.userType);

	function fetchSearchAssignments() {
		return getWithAuth(`api/searchTransfers?name=${route.params.name}&startDate=${route.params.startDate}&endDate=${route.params.endDate}`).then(res => {
			setAssignments(res.data.transfers);
		}).catch(err => {
			console.log(err);
		})
	}

	const navigateToDetails = function (assignment) {
		navigation.navigate("AssignmentDetails", {assignment: assignment, isAdmin: userType === 1})
	};

	return(
		<View style={styles.container}>
			<AssignmentList title={"Assignments"} assignments={assignments} fetchAssignments={fetchSearchAssignments} onItemPress={navigateToDetails}/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: BACKGROUND_COLOR
	},
})