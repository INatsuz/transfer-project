import {Platform, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import Button from "../Button/Button";
import Modal from 'react-native-modal';
import {useNavigation} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {BACKGROUND_COLOR, DISABLED_TEXT_COLOR, ITEM_BORDER_COLOR, TEXT_COLOR} from "../../utils/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SearchModal(props) {
	let [searchInput, setSearchInput] = useState("");

	let navigation = useNavigation();

	function onSearchButtonPress() {
		props.setIsVisible(false);
		navigation.navigate("SearchResults", {
			name: searchInput
		});
	}

	function onClosePress() {
		setSearchInput("");

		props.setIsVisible(false);
	}

	function onTimePress() {
		if (Platform.OS === "android") {
			setDate(new Date());

			if (!pickingDate && !pickingTime) setPickingDate(true);
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
			<View style={styles.container}>
				<Pressable onPress={onClosePress} style={styles.closeIcon}>
					<Ionicons name={"close"} color={TEXT_COLOR} size={22}/>
				</Pressable>
				<View style={styles.section}>
					<Text style={[styles.text, styles.title]}>Name: </Text>
					<TextInput style={[styles.input, styles.text]} placeholder={"eg. John Wick"} placeholderTextColor={DISABLED_TEXT_COLOR} value={searchInput} onChangeText={value => setSearchInput(value)}/>
				</View>
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
		marginBottom: 5,
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