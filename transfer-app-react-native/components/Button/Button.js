import {Pressable, StyleSheet, Text, Platform, View, TouchableHighlight, TouchableOpacity} from "react-native";

export default function Button(props) {
	return (
		<View>
			{ Platform.OS === "android" ?
				<Pressable style={[styles.buttonContainer, props.containerStyle, props.backgroundColor ? {backgroundColor: props.backgroundColor} : {}]} onPress={props.onPress} android_ripple={{
					color: 'gray',
				}}>
					<Text style={{...styles.button, ...props.textStyle}}>{props.text}</Text>
				</Pressable>
				:
				<TouchableOpacity style={[styles.buttonContainer, props.containerStyle, props.backgroundColor ? {backgroundColor: props.backgroundColor} : {}]} onPress={props.onPress} activeOpacity={0.85}>
					<Text style={{...styles.button, ...props.textStyle}}>{props.text}</Text>
				</TouchableOpacity>
			}
		</View>
	);
};

const styles = StyleSheet.create({
	buttonContainer: {
		padding: 7,
		backgroundColor: "#5F9EA0"
	},

	button: {
		backgroundColor: "transparent",
		textAlign: "center",
		color: "white",
		fontSize: 16,
		textTransform: "uppercase"
	}
});