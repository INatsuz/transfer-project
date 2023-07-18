import {Platform, Pressable, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {memo, useState} from 'react';
import getStatusColor from "../../utils/StatusColor";
import Ionicons from "@expo/vector-icons/Ionicons";
import Tooltip from "react-native-walkthrough-tooltip";
import {useSelector} from "react-redux";
import * as Linking from "expo-linking";
import {IP} from "../../utils/Requester";
import {ITEM_BACKGROUND_COLOR, ITEM_BORDER_COLOR, TEXT_COLOR} from "../../utils/Colors";

function AssignmentListItem(props) {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false);

	const isAdmin = useSelector(state => state.login.userType === 1);

	let datetime = new Date(props.data.transfer_time);
	const dateString = String(datetime.getDate()).padStart(2, "0") + "/" + String(datetime.getMonth() + 1).padStart(2, "0") + "/" + datetime.getFullYear();
	const timeString = String(datetime.getHours()).padStart(2, "0") + ":" + String(datetime.getMinutes()).padStart(2, "0");

	let variableStyles = StyleSheet.create({
		statusBorderColor: {
			borderRightColor: getStatusColor(props.data.status)
		}
	});

	function onSharePress() {
		let url = `https://${IP}/deeplink/${Linking.createURL("/home/add", {
			queryParams:
				{
					name: props.data.person_name,
					people: props.data.num_of_people,
					origin: props.data.origin,
					destination: props.data.destination,
					price: props.data.price,
					paid: props.data.paid ? props.data.paid : 0,
					datetime: props.data.transfer_time,
					status: props.data.status,
					flight: props.data.flight,
					paymentMethod: props.data.payment_method,
					operator: props.data.operatorName,
					observations: props.data.observations
				}
		})}`
		Share.share({
			title: "Service Sharing",
			message: decodeURI(url),
			url: decodeURI(url)
		}).then(res => {
			console.log(res);
		});
	}

	return (
		<TouchableOpacity delayPressIn={20} onPress={() => props.onItemPress(props.data)}>
			<View style={[styles.listItemContainer, variableStyles.statusBorderColor]}>
				{
					isAdmin && props.data.driver &&
					<View style={styles.driverIconPosition}>
						<Pressable onPress={() => setIsTooltipVisible(true)}>
							<View style={styles.driverIconContainer}>
								<Tooltip
									isVisible={isTooltipVisible}
									content={
										<Text>{props.data.driverName}</Text>
									}
									placement="top"
									onClose={() => setIsTooltipVisible(false)}
									disableShadow={true}
									topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
								>
									<Ionicons name={"person"} size={16} color={props.data.color}/>
								</Tooltip>
							</View>
						</Pressable>
					</View>
				}
				<View style={styles.shareIconContainer}>
					<Pressable onPress={onSharePress}>
						<Ionicons name={"share-social"} size={16} color={TEXT_COLOR}/>
					</Pressable>
				</View>
				<View style={styles.itemColumn}>
					<View style={styles.topItemField}>
						<Text style={styles.textStyle}>Date/Time:</Text>
						<Text style={styles.textStyle}>{dateString} <Text style={styles.time}>{timeString}</Text></Text>
					</View>
					<View>
						<Text style={styles.textStyle}>Origin:</Text>
						<Text style={styles.textStyle}>{props.data.origin}</Text>
					</View>
				</View>
				<View style={styles.itemColumn}>
					<View style={styles.topItemField}>
						<Text style={styles.textStyle}>Person:</Text>
						<Text style={styles.textStyle}>{props.data.person_name}</Text>
					</View>
					<View>
						<Text style={styles.textStyle}>Destination:</Text>
						<Text style={styles.textStyle}>{props.data.destination}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	listItemContainer: {
		position: "relative",
		overflow: "hidden",
		flexDirection: "row",
		borderRadius: 10,
		borderWidth: 1,
		borderRightWidth: 4,
		borderTopColor: ITEM_BORDER_COLOR,
		borderLeftColor: ITEM_BORDER_COLOR,
		borderBottomColor: ITEM_BORDER_COLOR,
		marginVertical: 2,
		marginHorizontal: 10,
		paddingVertical: 10,
		paddingHorizontal: 10,
		minHeight: 85,
		backgroundColor: ITEM_BACKGROUND_COLOR
	},

	itemColumn: {
		width: "50%",
		height: "100%"
	},

	topItemField: {
		marginBottom: 10
	},

	textStyle: {
		color: TEXT_COLOR,
		fontSize: 14
	},

	time: {
		fontWeight: "bold"
	},

	driverIconPosition: {
		position: "absolute",
		top: 0,
		right: 0,
		zIndex: 1
	},

	driverIconContainer: {
		padding: 15
	},

	shareIconContainer: {
		position: "absolute",
		bottom: 0,
		right: 0,
		zIndex: 1,
		padding: 15
	}
});

export default memo(AssignmentListItem)