import {Text, View, StyleSheet, Image} from "react-native";
import React from 'react';

export default function Banner (props) {
	return (
		<View style={styles.container}>
			<Image style={styles.image} source={require("../../assets/logo.png")}/>
			{/*<Text style={styles.title}>Transfer Service</Text>*/}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "80%",
		display: "flex",
		flexShrink: 1,
		alignItems: "center"
	},

	image: {
		marginTop: 20,
		height: 160,
		resizeMode: "contain",
		marginBottom: 20,
	},

	title: {
		color: "#fff",
		fontSize: 30,
		fontWeight: "bold"
	}
});