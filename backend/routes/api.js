const express = require('express');
const router = express.Router();
const {verifyToken, mustBeAuthenticated, mustBeAdmin} = require("../utils/authentication");
const getConnection = require('../utils/db');

router.get("/getAssignedJobs", function (req, res, next) {
	let token = req.query.token;

	if (token) {
		verifyToken(token).then(payload => {
			getConnection().query("SELECT transfer.*, appuser.name as driverName FROM transfer INNER JOIN appuser WHERE transfer.status <> 'FINISHED' AND transfer.driver = ? AND transfer.driver = appuser.ID", [payload.ID], function (err, transfers, fields) {
				console.log(transfers);
				if (transfers) {
					res.status(200).json(transfers);
				}
			});
		}).catch(err => {
			console.log(err);
			res.status(401).json({err: "Unauthorized"});
		});
	} else {
		res.status(401).json({err: "Invalid token"});
	}
});

// TODO Finish getHomeInfo endpoint
router.get("/getHomeInfo", mustBeAuthenticated, function (req, res, next) {
	res.status(200).json({payload: req.tokenPayload});
});

router.get("/getAllAssignments", mustBeAdmin, function (req, res, next) {
	getConnection().query("SELECT transfer.*, appuser.name as driverName FROM transfer INNER JOIN appuser WHERE transfer.status <> 'FINISHED' AND transfer.driver = appuser.ID", function (err, transfers, fields) {
		console.log(transfers);
		if (err) {
			console.log(err);
			res.status(400).json({err: "Something went wrong when fetching the transfers"});
		} else {
			res.status(200).json(transfers);
		}
	});
});

router.put("/updateTransfer", mustBeAdmin, function (req, res, next) {
	let {transferID, driverID} = req.body;

	if (transferID && driverID) {
		getConnection().query("UPDATE transfer SET driver = ? WHERE ID = ?", [driverID, transferID], function (err, result, fields) {
			if (err) {
				console.log(err);
				res.status(406).json({err: "Something went wrong with the query"});
				return;
			}
			res.status(200).json({result: "Driver updated successfully"});
		});
	} else {
		res.status(400).json({err: "Missing parameters"});
	}
});

router.put("/setDriver", mustBeAdmin, function (req, res, next) {
	let {transferID, driverID} = req.body;

	if (transferID && driverID) {
		getConnection().query("UPDATE transfer SET driver = ? WHERE ID = ?", [driverID, transferID], function (err, result, fields) {
			if (err) {
				console.log(err);
				res.status(406).json({err: "Something went wrong with the query"});
				return;
			}
			res.status(200).json({result: "Driver updated successfully"});
		});
	} else {
		res.status(400).json({err: "Missing parameters"});
	}
});

module.exports = router;