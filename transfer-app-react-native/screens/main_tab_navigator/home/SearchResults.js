import {Platform, SafeAreaView, StatusBar, View} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import {getWithAuth} from "../../../utils/Requester";
import {useState} from "react";
import {StyleSheet} from "react-native";
import {useSelector} from "react-redux";
import {BACKGROUND_COLOR} from "../../../utils/Colors";

export default function SearchResults({route, navigation}) {
	let [assignments, setAssignments] = useState();
	const userType = useSelector(state => state.login.userType);

	function fetchSearchAssignments() {
		return getWithAuth(`api/searchTransfers?name=${route.params.name}`).then(res => {
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

const statusBarHeight = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: BACKGROUND_COLOR
	},
})