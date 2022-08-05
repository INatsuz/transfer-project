const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const JWT_SECRET = "w5JVIErNaQ";

const ACCESS_TOKEN_DURATION = "1h";
const REFRESH_TOKEN_DURATION = "7d";

function verifyLoginCredentials(email, password) {
	return new Promise((resolve, reject) => {
		db.query("SELECT * FROM appuser WHERE email = ?", [email]).then(({result}) => {
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
					email: result[0].email,
					name: result[0].name,
					userType: result[0].userType
				};
				console.log(payload);

				generateTokens(payload).then(tokens => {
					resolve({...tokens, payload: payload});
				}).catch(err => {
					reject(err);
				});

			});
		}).catch(err => {
			reject(err);
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
		jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_DURATION}, function (err, accessToken) {
			if (err) {
				console.log(err);
				reject(err);
			}

			jwt.sign(payload, JWT_SECRET, {expiresIn: REFRESH_TOKEN_DURATION}, function (err, refreshToken) {
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

function mustBeAuthenticated(req, res, next) {
	let authHeader = req.header("Authorization");

	if (!authHeader) {
		res.status(401).json({err: "Unauthorized"});
	}

	if (!authHeader.startsWith("Bearer ")) {
		res.status(401).json({err: "Unauthorized"});
	}
	let accessToken = authHeader.slice(7);

	jwt.verify(accessToken, JWT_SECRET, {}, function (err, payload) {
		if (err) {
			res.status(401).json({err: "Unauthorized"});
			return;
		}

		req.tokenPayload = payload;
		next();
	});
}

function mustBeAdmin(req, res, next) {
	let authHeader = req.header("Authorization");

	if (!authHeader) {
		res.status(401).json({err: "Unauthorized"});
	}

	if (!authHeader.startsWith("Bearer ")) {
		res.status(401).json({err: "Unauthorized"});
	}
	let accessToken = authHeader.slice(7);

	jwt.verify(accessToken, JWT_SECRET, {}, function (err, payload) {
		if (err) {
			res.status(401).json({err: "Unauthorized"});
			return;
		}

		if (payload.userType !== 1) {
			res.status(403).json({err: "Not an admin"});
			return;
		}

		req.tokenPayload = payload;
		next();
	});
}

module.exports.verifyLoginCredentials = verifyLoginCredentials;
module.exports.verifyToken = verifyToken;
module.exports.generateTokens = generateTokens;
module.exports.mustBeAuthenticated = mustBeAuthenticated;
module.exports.mustBeAdmin = mustBeAdmin;