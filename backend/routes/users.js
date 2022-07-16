const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {verifyLoginCredentials, verifyToken, generateTokens} = require("../utils/authentication");
const getConnection = require('../utils/db');

const SALT_ROUNDS = 10;

// Login GET method
router.get('/login', function (req, res, next) {
	console.log("Test");
	verifyLoginCredentials(req.query.email, req.query.password).then(({accessToken, refreshToken}) => {
		res.status(200).json({accessToken: accessToken, refreshToken: refreshToken});
	}).catch(err => {
		console.log(err);
		res.status(401).json({err: "Wrong credentials"});
	});
});

// Login POST method
router.post('/login', function (req, res, next) {
	console.log(req.body.email);
	console.log(req.body.password);
	verifyLoginCredentials(req.body.email, req.body.password).then(({accessToken, refreshToken, payload}) => {
		res.status(200).json({accessToken: accessToken, refreshToken: refreshToken, user: payload});
	}).catch(err => {
		console.log(err);
		res.status(401).json({err: "Wrong credentials"});
	});
});

/* GET users listing. */
router.get('/register', function (req, res, next) {
	let {email, password, name, birthday, userType} = req.query
	bcrypt.hash(password, SALT_ROUNDS, function (err, hash) {
		getConnection().query("INSERT INTO appuser(email, password, name, birthday, userType) VALUES (?, ?, ?, ?, ?)", [email, hash, name, birthday, userType], function (error, results, fields) {
			if (err) {
				console.log(err.code);
				res.status(400).json({err: "Couldn't register you"});
				return;
			}

			res.status(200).send("Account created successfully");
		});
	});
});

router.get("/renew", function (req, res, next) {
	let {refreshToken} = req.query;
	if (refreshToken) {
		verifyToken(refreshToken).then(payload => {
			let newPayload = {ID: payload.ID, email: payload.email, name: payload.name, userType: payload.userType};
			generateTokens(newPayload).then(tokens => {
				res.status(200).json({...tokens, user: newPayload});
			}).catch(err => {
				console.log(err);
				res.status(401).json({err: "Could not renew token"});
			});
		}).catch(err => {
			console.log(err);
			res.status(401).json({err: "Could not renew token"});
		});
	}
});

router.get("/checkLogin", function (req, res, next) {
	let {token} = req.query;

	verifyToken(token).then(payload => {
		res.status(200).json({"loggedIn": true, user: {email: payload.email, name: payload.name, userType: payload.userType}});
	}).catch(err => {
		console.log(err);
		res.status(401).json({"loggedIn": false});
	});
});

router.get("/getUserData", function (req, res, next) {
	let {token} = req.query;

	verifyToken(token).then(payload => {
		console.log(payload.ID);
		getConnection().query("SELECT * FROM appuser WHERE ID = ?", [payload.ID], function (err, user, fields) {
			console.log(user);
			if (user) {
				let userData = {
					ID: user[0].ID,
					userType: user[0].userType,
					name: user[0].name,
					email: user[0].email,
					birthday: user[0].birthday
				};

				res.status(200).json(userData);
			}
		});
	}).catch(err => {
		console.log(err);
	});
});

router.get('/create_debug_user', function (req, res) {
	let email = "test@test.com";
	let password = "2509";
	let name = "Test User";
	let birthday = "1999-09-25";
	let userType = 2;

	bcrypt.hash(password, SALT_ROUNDS, function (err, hash) {
		getConnection().query("INSERT INTO appuser(email, password, name, birthday, userType) VALUES (?, ?, ?, ?, ?)", [email, hash, name, birthday, userType], function (error, results, fields) {
			if (error) {
				console.log(error.code);
				res.status(400).json({err: "Couldn't register you"});
			} else {
				res.status(200).send("Account created successfully");
			}
		});
	});
});

module.exports = router;
