var apn = require('apn');
var gcm = require('node-gcm');

var androidServerPushToken = "";

function getOptions() {
	return {
		cert: __dirname + '/../certificates/cert_development.pem',
		key: __dirname + '/../certificates/key_development.pem',
		production: false
	};
}

function sendAPN(token, alert, payload) {
	if (token.length != 64) {
		console.info("token deleted: " + token);
		return;
	}
	var device = new apn.Device(token);
	var notification = new apn.Notification();
	notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	notification.alert = alert;
	notification.payload = payload;

	var options = getOptions();

	var connection = new apn.Connection(options);

	connection.on('transmitted', function(notification, device) {
		console.log("APN transmitted to:" + device.token.toString('hex'));
	});

	connection.on('transmissionError', function(errCode, notification, device) {
		console.error("APN error: " + errCode + " for device ", device, notification);
	});

	connection.on('timeout', function() {
		console.error("APN connection timeout");
	});

	connection.pushNotification(notification, device);
}

function sendGCM(token, data) {
	var message = new gcm.Message();
	message.addDataWithObject(data);

	var registrationIds = [token];

	var sender = new gcm.Sender(androidServerPushToken);
	sender.send(message, registrationIds, 3, function(err, result) {
		if (err) {
			logger.error("GCM error: " + err);
		} else {
			logger.info(result);
		}
	});
}

function sendPush(user, payload, message) {
	if (payload === undefined) {
		payload = {};
	}
	if (radar.platform === 'IOS') {
		sendAPN(user.token, message, payload);
	} else if (user.platform === 'ANDROID') {
		var data = {
			message: message,
			data: payload
		};
		sendGCM(user.token, data);
	}
}

exports.sendTagToUser = function(user, tag) {
	sendPush(user, tag, {
		'loc-key': 'there is a match!'
	});
}