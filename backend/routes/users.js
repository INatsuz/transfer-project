const express = require('express');
const bcrypt = require('bcrypt')
const mysql = require('mysql');
const router = express.Router();
const {verifyLoginCredentials, verifyToken, generateTokens} = require("../utils/authentication");
const getConnection = require('../utils/db');

const SALT_ROUNDS = 10;

/* GET users listing. */
router.get('/login', function (req, res, next) {
	verifyLoginCredentials(req.query.email, req.query.password).then(({accessToken, refreshToken}) => {
		res.status(200).json({accessToken: accessToken, refreshToken: refreshToken});
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
	let {refreshToken, email} = req.query;
	if (refreshToken) {
		verifyToken(refreshToken).then(payload => {
			if (payload.email !== email) {
				console.log("Email is wrong");
				res.status(401).json({err: "Could not renew token"});
				return;
			}
			let newPayload = {ID: payload.ID, email: payload.email};
			generateTokens(newPayload).then(tokens => {
				res.status(200).json(tokens);
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
		console.log("Confirmed");
		console.log(payload);
		res.status(200).json({"loggedIn": true});
	}).catch(err => {
		console.log("Not Logged In");
		console.log(err);
		res.status(401).json({"loggedIn": false});
	});
});

router.get('/create_debug_user', function (req, res) {
	let email = "vascoraminhos@hotmail.com";
	let password = "2509";
	let name = "Vasco Raminhos";
	let birthday = "1999-09-25";
	let userType = 1;

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
