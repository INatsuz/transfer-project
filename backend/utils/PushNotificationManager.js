const { Expo } = require('expo-server-sdk')

let expo = new Expo({});

async function sendPushNotification(token, message) {
	let messages = [];

	console.log(token)
	console.log(Expo.isExpoPushToken(token));

	if (Expo.isExpoPushToken(token)) {
		messages.push({
			to: token,
			sound: 'default',
			body: message,
			title: "Transfer App Notification",
			priority: "high"
		});
		console.log("Sending now...");
		await expo.sendPushNotificationsAsync(messages);
		console.log("Sent");
	}
}

module.exports.sendPushNotification = sendPushNotification;