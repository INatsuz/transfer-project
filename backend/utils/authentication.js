const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const JWT_SECRET = "naNrdh7vkW7spp53ISGLc7qyVTIJBbvk";

const ACCESS_TOKEN_DURATION = "30m";
const REFRESH_TOKEN_DURATION = "7d";

const USER_TYPES = {ADMIN: 1, DRIVER: 2, HOTEL: 3, MANAGER: 4};

function verifyLoginCredentials(email, password, ...types) {
	console.log(types);
	let userTypeFilters = [];
	let typeFilterParams = [];

	types.forEach(type => {
		userTypeFilters.push("userType = ?");
		typeFilterParams.push(type);
	});

	let userTypeFilter = ` AND (${userTypeFilters.join(" OR ")})`;

	let query = "SELECT * FROM appuser WHERE email = ?" + (types.length > 0 ? userTypeFilter : "");
	let params = (types.length > 0 ? [email, ...typeFilterParams] : [email]);

	console.log(query);
	console.log(params);

	return new Promise((resolve, reject) => {
		db.query(query, params).then(({result}) => {
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
				}

				resolve(result[0]);
			});
		}).catch(err => {
			reject(err);
		});
	});
}

function verifyLoginAndGenerateTokens(email, password, ...types) {
	return new Promise((resolve, reject) => {
		verifyLoginCredentials(email, password, ...types).then(result => {
			let payload = {
				ID: result.ID,
				email: result.email,
				name: result.name,
				userType: result.userType
			};

			generateTokens(payload).then(tokens => {
				resolve({...tokens, payload: payload});
			}).catch(err => {
				reject(err);
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

			jwt.sign({
				...payload,
				isRefreshToken: true
			}, JWT_SECRET, {expiresIn: REFRESH_TOKEN_DURATION}, function (err, refreshToken) {
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
	let accessToken = extractToken(req, res);

	jwt.verify(accessToken, JWT_SECRET, {}, function (err, payload) {
		if (err) {
			res.status(401).json({err: "Unauthorized"});
			return;
		}

		if (payload.isRefreshToken) {
			res.status(401).json({err: "Unauthorized"});
			return;
		}

		req.tokenPayload = payload;
		next();
	});
}

function mustBeAdmin(req, res, next) {
	let accessToken = extractToken(req, res);

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

function mustBeUserType(...types) {
	return (req, res, next) => {
		let accessToken = extractToken(req, res);

		jwt.verify(accessToken, JWT_SECRET, {}, function (err, payload) {
			if (err) {
				res.status(401).json({err: "Unauthorized"});
				return;
			}

			if (!types.includes(payload.userType)) {
				res.status(403).json({err: "Not an authorized user type"});
				return;
			}

			req.tokenPayload = payload;
			next();
		});
	}
}

function mustHaveSession(req, res, next) {
	if (!req.session.userID) {
		res.status(401).redirect("/admin/login");
		return;
	}

	next();
}

function mustHaveAdminSession(req, res, next) {
	if (!req.session.userID) {
		res.status(401).redirect("/admin/login");
		return;
	}

	if (req.session.userType !== USER_TYPES.ADMIN) {
		res.status(401).redirect("/admin/login");
		return;
	}

	next();
}

function extractToken(req, res) {
	let authHeader = req.header("Authorization");

	if (!authHeader) {
		res.status(401).json({err: "Unauthorized"});
	}

	if (!authHeader.startsWith("Bearer ")) {
		res.status(401).json({err: "Unauthorized"});
	}

	return authHeader.slice(7);
}

module.exports.USER_TYPES = USER_TYPES;
module.exports.verifyLoginCredentials = verifyLoginCredentials;
module.exports.verifyLoginAndGenerateTokens = verifyLoginAndGenerateTokens;
module.exports.verifyToken = verifyToken;
module.exports.generateTokens = generateTokens;
module.exports.mustBeAuthenticated = mustBeAuthenticated;
module.exports.mustBeAdmin = mustBeAdmin;
module.exports.mustBeUserType = mustBeUserType;
module.exports.mustHaveSession = mustHaveSession;
module.exports.mustHaveAdminSession = mustHaveAdminSession;
