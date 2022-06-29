import {ScrollView, StyleSheet, View, RefreshControl, Text} from "react-native";
import AssignmentListItem from "./AssignmentListItem";
import {useEffect, useState} from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const sampleData = [
	{
		id: 1,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 2,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 3,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 4,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 5,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 6,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 7,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 8,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 9,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 10,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 11,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 12,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 13,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 14,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Lisboa",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}, {
		id: 15,
		name: "Vasco Raminhos",
		numPeople: 5,
		origin: "Aeroporto de Loule",
		destination: "Torre de Belém",
		timeDate: Date.parse("2022-06-11T10:30:00Z")
	}
];

const IP = "81.84.159.96";

async function getTokens() {
	let accessToken = await SecureStore.getItemAsync("accessToken");
	let refreshToken = await SecureStore.getItemAsync("refreshToken");

	if (accessToken && refreshToken) {
		return {accessToken: accessToken, refreshToken: refreshToken};
	} else {
		return false;
	}
}

const wait = (timeout) => {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function AssignmentList(props) {
	const [refreshing, setRefreshing] = useState(true);

	useEffect(function () {
		props.fetchAssignments().then(() => {
			setRefreshing(false);
		}).catch(err => {
			console.log(err);
		});
	}, []);

	return (
		<View style={styles.container}>
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
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		borderColor: "#AB81CD",
		borderWidth: 2,
		borderStyle: "solid",
		paddingBottom: 2
	},

	title: {
		padding: 10,
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold"
	}
});