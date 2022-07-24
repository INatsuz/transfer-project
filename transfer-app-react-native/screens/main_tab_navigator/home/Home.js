import {StyleSheet, View} from "react-native";
import AssignmentList from "../../../components/AssignmentList/AssignmentList";
import ProfileSection from "../../../components/ProfileSection/ProfileSection";
import {useState} from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {useSelector} from "react-redux";

const IP = "vraminhos.com";

async function getTokens() {
	let accessToken = await SecureStore.getItemAsync("accessToken");
	let refreshToken = await SecureStore.getItemAsync("refreshToken");

	if (accessToken && refreshToken) {
		return {accessToken: accessToken, refreshToken: refreshToken};
	} else {
		return false;
	}
}

export default function Home(props) {
	const email = useSelector(state => state.login.email);
	const name = useSelector(state => state.login.name);
	const userType = useSelector(state => state.login.userType);

	const [assignments, setAssignments] = useState([]);

	const fetchAssignments = function (){
		return new Promise(function (resolve, reject) {
			getTokens().then(({accessToken, refreshToken}) => {
				axios.get(`http://${IP}:3000/api/getAssignedJobs?token=${accessToken}`).then(res => {
					setAssignments(res.data);
					resolve()
				}).catch(err => {
					console.log("Could not get assigned transfers");
					console.log(err);
					reject();
				});
			});
		});
	}

	const navigateToDetails = function (assignment) {
		console.log("Navigate to Details");
		props.navigation.navigate("AssignmentDetails", {assignment: assignment})
	};

	return (
		<View style={styles.container}>
			<View>
				<ProfileSection assignmentCount={assignments.length} userData={{userType: userType, name: name, email: email}} navigation={props.navigation}/>
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