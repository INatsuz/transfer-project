const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {verifyLoginAndGenerateTokens, verifyToken, generateTokens, mustBeAuthenticated} = require("../utils/authentication");
const db = require('../utils/db');

const SALT_ROUNDS = 10;

// Login POST method
router.post('/login', function (req, res, next) {
	console.log(req.body);
	verifyLoginAndGenerateTokens(req.body.email, req.body.password).then(({accessToken, refreshToken, payload}) => {
		res.status(200).json({accessToken: accessToken, refreshToken: refreshToken, user: payload});

		db.query(`UPDATE appuser SET notificationToken = ? WHERE email = ?`, [req.body.notificationToken, req.body.email]).then(() => {
			console.log("Updated notification token on login for " + req.body.email);
		}).catch(err => {
			console.log(err);
		});
	}).catch(err => {
		console.log(err);
		res.status(401).json({err: "Wrong credentials"});
	});
});

/* GET users listing. */
router.get('/register', function (req, res, next) {
	let {email, password, name, birthday, userType} = req.query
	bcrypt.hash(password, SALT_ROUNDS, function (err, hash) {
		db.query(`INSERT INTO appuser(email, password, name, birthday, userType) 
					VALUES (?, ?, ?, ?, ?)`, [email, hash, name, birthday, userType]).then(({result, fields}) => {
			res.status(200).send("Account created successfully");
		}).catch(err => {
			console.log(err.code);
			res.status(400).json({err: "Couldn't register you"});
		});
	});
});

router.get("/renew", function (req, res, next) {
	let {refreshToken : token} = req.query;
	if (token && token.isRefreshToken) {
		verifyToken(token).then(payload => {
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
	} else {
		res.status(401).json("Could not renew token");
	}
});

router.get("/checkLogin", mustBeAuthenticated, function (req, res, next) {
	res.status(200).json({
		"loggedIn": true,
		user: {ID: req.tokenPayload.ID, email: req.tokenPayload.email, name: req.tokenPayload.name, userType: req.tokenPayload.userType}
	});
});

router.get("/getUserData", function (req, res, next) {
	let {token} = req.query;

	verifyToken(token).then(payload => {
		console.log(payload.ID);
		db.query("SELECT * FROM appuser WHERE ID = ?", [payload.ID]).then(({result: user, fields}) => {
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
		if (err) {
			res.status(400).json({err: "Couldn't register you"});
		}

		db.query("INSERT INTO appuser(email, password, name, birthday, userType) VALUES (?, ?, ?, ?, ?)",
			[email, hash, name, birthday, userType]).then(({result, fields}) => {
			res.status(200).send("Account created successfully");
		}).catch(err => {
			console.log(err.code);
			res.status(400).json({err: "Couldn't register you"});
		});
	});
});

module.exports = router;
