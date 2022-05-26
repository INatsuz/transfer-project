const getConnection = require('./db');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const JWT_SECRET = "w5JVIErNaQ";

function verifyLoginCredentials(email, password) {
	return new Promise((resolve, reject) => {
		getConnection().query("SELECT * FROM appuser WHERE email = ?", [email], function (err, result, fields) {
			if (err) {
				reject(err);
				return;
			}

			if (result.length === 0) {
				reject("No results found in db");
				return;
			}

			bcrypt.compare(password, result[0].password, function (err, isEqual) {
				if (err) {
					console.log(err);
					reject(err);
					return;
				}

				if (!isEqual) {
					reject("Wrong credentials");
					return;
				}
				let payload = {
					ID: result[0].ID,
					email: result[0].email
				};
				console.log(payload);

				generateTokens(payload).then(tokens => {
					resolve(tokens);
				}).catch(err => {
					reject(err);
				});

			});
		});
	});
}

function verifyToken(accessToken) {
	return new Promise((resolve, reject) => {
		jwt.verify(accessToken, JWT_SECRET, {}, function (err, payload) {
			if (err) {
				reject(err);
				return;
			}

			resolve(payload);
		});
	});
}

function generateTokens(payload) {
	return new Promise(function (resolve, reject) {
		jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"}, function (err, accessToken) {
			if (err) {
				console.log(err);
				reject(err);
			}

			jwt.sign(payload, JWT_SECRET, {expiresIn: "2d"}, function (err, refreshToken) {
				if (err) {
					console.log(err);
					reject(err);
				}

				resolve({accessToken, refreshToken});
			});
		});
	});
}

function refreshAccessToken(refreshToken) {
	return new Promise((resolve, reject) => {
		verifyToken(refreshToken).then(payload => {
			generateTokens(payload).then(tokens => {
				resolve(tokens);
			}).catch(err => {
				reject(err);
			});
		}).catch(err => {
			reject(err);
		});
	});
}

module.exports.verifyLoginCredentials = verifyLoginCredentials;
module.exports.verifyToken = verifyToken;
module.exports.generateTokens = generateTokens;