import {Pressable, StyleSheet, TextInput, View} from "react-native";
import {useState} from "react";
import Button from "../Button/Button";
import Modal from 'react-native-modal';
import {useNavigation} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

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
		props.setIsVisible(false);
	}

	return (
		<Modal
			isVisible={props.isVisible}
			hasBackdrop={true}
			backdropOpacity={0.1}
			backdropColor={"white"}
			onBackdropPress={onClosePress}
			onModalHide={() => setSearchInput("")}
		>
			<View style={styles.container}>
				<Pressable onPress={onClosePress} style={styles.closeIcon}>
					<Ionicons name={"close"} color={"white"} size={22}/>
				</Pressable>
				<TextInput style={[styles.input, styles.text]} placeholder={"eg. John Wick"} placeholderTextColor="#A3A9AA" value={searchInput} onChangeText={value => setSearchInput(value)}/>
				<Button text={"Search"} onPress={onSearchButtonPress}/>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 30,
		borderRadius: 10,
		backgroundColor: "#222222",
		display: "flex",
		justifyContent: "center"
	},

	closeIcon: {
		position: "absolute",
		top: 10,
		right: 10,
	},

	text: {
		color: "#fff",
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
		alignSelf: "center",
		marginVertical: 15
	},
});