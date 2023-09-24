import {Platform, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import Button from "../Button/Button";
import Modal from 'react-native-modal';
import {useNavigation} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {BACKGROUND_COLOR, DISABLED_TEXT_COLOR, ITEM_BORDER_COLOR, TEXT_COLOR} from "../../utils/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CalendarSearchModal(props) {
	const [date, setDate] = useState(new Date());

	const [pickingDate, setPickingDate] = useState(false);

	let dateString = date ? String(date.getDate()).padStart(2, "0") + "/" + String(date.getMonth() + 1).padStart(2, "0") + "/" + date.getFullYear() : "--/--/----";

	let navigation = useNavigation();

	function onSearchButtonPress() {
		date.setHours(0, 0, 0, 0)
		let endDate = new Date(date.getTime())
		endDate.setDate(date.getDate() + 1)
		props.setIsVisible(false);
		navigation.navigate("SearchResults", {
			startDate: date.toISOString(),
			endDate: endDate.toISOString()
		});
	}

	function onClosePress() {
		setPickingDate(false);
		setDate(new Date());

		props.setIsVisible(false);
	}

	function onTimePress() {
		if (Platform.OS === "android") {
			setDate(new Date());

			if (!pickingDate) setPickingDate(true);
		}
	}

	return (
		<Modal
			isVisible={props.isVisible}
			hasBackdrop={true}
			backdropOpacity={0.2}
			backdropColor={"black"}
			onBackdropPress={onClosePress}
			onModalHide={onClosePress}
		>
			{pickingDate && Platform.OS === "android" &&
				<DateTimePicker value={date} mode="date" onChange={(event, date) => {
					setPickingDate(false);
					setDate(date);
				}}/>}
			<View style={styles.container}>
				<Pressable onPress={onClosePress} style={styles.closeIcon}>
					<Ionicons name={"close"} color={TEXT_COLOR} size={22}/>
				</Pressable>
				{
					Platform.OS === "ios" ?
						<View style={styles.section}>
							<View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
								<View>
									<Text style={[styles.text, styles.title, {
										paddingBottom: 0
									}]}>Date: </Text>
								</View>
								<DateTimePicker value={date} mode="date" onChange={(event, datetime) => {
									setDate(datetime);
								}}/>
							</View>
						</View>
						:
						<View>
							<Text style={[styles.text, styles.title]}>Date: </Text>
							<Pressable onPress={onTimePress}>
								<TextInput pointerEvents={"none"} editable={false} value={dateString} style={[styles.text, styles.input]}/>
							</Pressable>
						</View>
				}
				<Button text={"Search"} onPress={onSearchButtonPress}/>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 30,
		borderRadius: 10,
		backgroundColor: BACKGROUND_COLOR,
		display: "flex",
		justifyContent: "center"
	},

	closeIcon: {
		position: "absolute",
		top: 10,
		right: 10,
	},

	text: {
		color: TEXT_COLOR,
		fontSize: 18
	},

	title: {
		fontWeight: "bold",
	},

	section: {
		marginBottom: 15,
	},

	input: {
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 5,
		borderColor: ITEM_BORDER_COLOR,
		borderStyle: "solid",
		borderWidth: 2,
		paddingVertical: 7,
		paddingHorizontal: 10,
		color: TEXT_COLOR,
		fontSize: 16,
		width: "100%",
		alignSelf: "center",
		marginVertical: 15
	},
});