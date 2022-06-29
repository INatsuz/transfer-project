import {Button, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from '@react-native-community/datetimepicker';
import {Chevron} from "react-native-shapes";
import {useEffect, useState} from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";

export default function AssignmentDetails(props) {
	const {assignment, isEditable} = props.route.params;

	let datetime = new Date(assignment.transfer_time);
	let dateString = String(datetime.getDate()).padStart(2, "0") + "/" + String(datetime.getMonth() + 1).padStart(2, "0") + "/" + datetime.getFullYear();
	let timeString = String(datetime.getHours()).padStart(2, "0") + ":" + String(datetime.getMinutes()).padStart(2, "0");

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: "#222222",
			borderTopColor: "#AB81CD",
			borderTopWidth: 1,
			borderStyle: "solid",
			paddingVertical: 10
		},

		scrollView: {
			paddingHorizontal: 10,
		},

		section: {
			marginBottom: 15
		},

		text: {
			color: "#fff",
			fontSize: 18
		},

		title: {
			fontWeight: "bold",
			marginBottom: 5,
			paddingLeft: isEditable ? 10 : 0
		},

		textStyle: {
			color: "white",
			fontSize: 18
		},

		input: {
			backgroundColor: "#222222",
			borderRadius: 5,
			borderColor: "#A3A9AA",
			borderStyle: "solid",
			borderWidth: 2,
			paddingVertical: 7,
			paddingHorizontal: 10,
			color: "white",
			fontSize: 16,
			width: "100%",
			alignSelf: "center"
		}
	});

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				{/*<Text style={styles.text}>{JSON.stringify(assignment)}</Text>*/}
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Person: </Text>
					{isEditable ? <TextInput value={assignment.person_name} style={[styles.text, styles.input]}/> :
						<Text style={styles.text}>{assignment.person_name}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Number of People: </Text>
					{isEditable ?
						<TextInput value={assignment.num_of_people.toString()} style={[styles.text, styles.input]}/> :
						<Text style={styles.text}>{assignment.num_of_people}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Origin: </Text>
					{isEditable ? <TextInput value={assignment.origin} style={[styles.text, styles.input]}/> :
						<Text style={styles.text}>{assignment.origin}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Destination: </Text>
					{isEditable ? <TextInput value={assignment.destination} style={[styles.text, styles.input]}/> :
						<Text style={styles.text}>{assignment.destination}</Text>}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Time: </Text>
					{
						isEditable ?
							<Pressable>
								<TextInput editable={false} value={dateString + " - " + timeString} style={[styles.text, styles.input]}/>
							</Pressable>
							:
							<Text style={styles.text}>{dateString} - {timeString}</Text>
					}
				</View>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Driver: </Text>
					{
						isEditable ?
							<RNPickerSelect value={2} items={[
								{label: "Vasco Raminhos", value: 2},
								{label: "Test User", value: 12},
							]} onValueChange={() => {
							}} style={{
								iconContainer: {justifyContent: "center", padding: 15},
								inputAndroidContainer: {...styles.input, justifyContent: "center"},
								inputAndroid: styles.textStyle
							}} Icon={() => {
								return (<Chevron size={1.5} color="gray"/>);
							}} useNativeAndroidPickerStyle={false}/>

							:

							<Text style={styles.text}>{assignment.driverName}</Text>
					}
				</View>
				<View>
					{isEditable && <Button title={"Save"}/>}
				</View>
			</ScrollView>
		</View>
	);
};
