import {useState} from "react";
import {StyleSheet} from "react-native";

export default function useEmailField() {
	const regex = "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])";

	const [email, setEmail] = useState("");

	const isValidStyling = () => {
		if (email === "") return {};

		if (email.match(regex)) {
			return styles.valid
		}

		return styles.invalid;
	}

	return {email, setEmail, isValidStyling};
}

const styles = StyleSheet.create({
	valid: {
		borderColor: "#4BB543"
	},

	invalid: {
		borderColor: "#CC0000"
	}
});