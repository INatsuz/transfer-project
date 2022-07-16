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

router.get("/getDrivers", mustBeAdmin, function (req, res, next) {
	getConnection().query(`SELECT appuser.ID, appuser.name, appuser.activeVehicle, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName FROM appuser LEFT JOIN vehicle ON vehicle.ID = appuser.activeVehicle`, function (err, drivers, fields) {
		if (err) {
			res.status(400).json({err: "Something went wrong with the query"});
			return;
		}

		console.log(drivers);
		res.status(200).json({drivers: drivers});
	});
});

router.get("/getAllAssignments", mustBeAdmin, function (req, res, next) {
	getConnection().query("SELECT transfer.*, appuser.name as driverName FROM transfer LEFT JOIN appuser ON transfer.driver = appuser.ID WHERE status <> 'FINISHED'", function (err, transfers, fields) {
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
	let {ID, person_name, num_of_people, origin, destination, time, driver} = req.body;
	person_name = person_name.trim();
	origin = origin.trim();
	destination = destination.trim();
	console.log(driver);

	if (!Number.isInteger(ID) || ID <= 0) {
		res.status(400).json({err: "ID validation error"});
		return;
	}
	if (!person_name || person_name.length <= 0 || person_name.length > 128 || typeof (person_name) !== "string") {
		res.status(400).json({err: "Person name validation error"});
		return;
	}
	if (!Number.isInteger(num_of_people) || num_of_people <= 0 || num_of_people >= 100) {
		res.status(400).json({err: "Number of people validation error"});
		return;
	}
	if (!origin || origin.length <= 0 || origin.length > 128 || typeof (origin) !== "string") {
		res.status(400).json({err: "Origin validation error"});
		return;
	}
	if (!destination || destination.length <= 0 || destination.length > 128 || typeof (destination) !== "string") {
		res.status(400).json({err: "Destination validation error"});
		return;
	}
	if (!time || !Date.parse(time)) {
		console.log(Date.parse(time) < new Date());
		console.log(!time);
		console.log(time);
		res.status(400).json({err: "Time validation error"});
		return;
	}
	if ((driver != null && !Number.isInteger(driver)) || ID <= 0) {
		res.status(400).json({err: "Driver validation error"});
		return;
	}

	getConnection().query("UPDATE transfer SET person_name = ?, num_of_people = ?, origin = ?, destination = ?, transfer_time = ?, driver = ? WHERE ID = ?", [person_name, num_of_people, origin, destination, time, driver, ID], function (err, result, fields) {
		if (err) {
			console.log(err);
			res.status(406).json({err: "Something went wrong with the query"});
			return;
		}
		res.status(200).json({res: "Transfer updated with success"});
	});
});

router.post("/addTransfer", mustBeAdmin, function (req, res, next) {
	let {person_name, num_of_people, origin, destination, datetime} = req.body;

	if (person_name && num_of_people && origin && destination && datetime) {
		getConnection().query("INSERT INTO transfer(person_name, num_of_people, price, origin, destination, transfer_time, status, paid) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [person_name, num_of_people, 0, origin, destination, datetime, 'PENDING', true], function (err, result, fields) {
			if (err) {
				console.log(err);
				res.status(406).json({err: "Something went wrong with the query"});
			}

			res.status(200).json({res: "Transfer added successfully"});
		});
	} else {
		res.status(400).json({err: "Missing parameters"});
	}
});

module.exports = router;