const express = require('express');
const router = express.Router();
const {verifyToken, mustBeAuthenticated, mustBeAdmin} = require("../utils/authentication");
const db = require('../utils/db');

router.get("/getAssignedJobs", function (req, res, next) {
	let token = req.query.token;

	if (token) {
		verifyToken(token).then(payload => {
			db.query(`SELECT transfer.*, appuser.name as driverName, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName
						FROM transfer 
						INNER JOIN appuser
						ON transfer.driver = appuser.ID
						LEFT JOIN vehicle
						ON transfer.vehicle = vehicle.ID
						WHERE transfer.status <> 'FINISHED'
						AND appuser.ID = ?;`, [payload.ID]).then(({result: transfers, fields}) => {
				console.log(transfers);
				if (transfers) {
					res.status(200).json(transfers);
				}
			}).catch(err => {
				console.log(err);
				console.log("Something went wrong getting assigned jobs");
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
	db.query(`SELECT appuser.ID, appuser.name, appuser.activeVehicle, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName 
			FROM appuser 
			LEFT JOIN vehicle 
			ON vehicle.ID = appuser.activeVehicle`, []).then(({result: drivers, fields}) => {
		console.log(drivers);
		res.status(200).json({drivers: drivers});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
	});
});

router.get("/getVehicles", mustBeAuthenticated, function (req, res, next) {
	db.query(`SELECT vehicle.*, appuser.ID as userID, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as displayName 
				FROM vehicle 
				LEFT JOIN appuser 
				ON appuser.activeVehicle = vehicle.ID 
				AND appuser.ID = ? 
				ORDER BY userID DESC;`, [req.tokenPayload.ID]).then(({result: vehicles, fields}) => {
		console.log(vehicles);
		res.status(200).json({vehicles: vehicles});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
	})
});

router.get("/getAllAssignments", mustBeAdmin, function (req, res, next) {
	db.query(`SELECT transfer.*, appuser.name as driverName, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName
					FROM transfer 
					LEFT JOIN appuser 
					ON transfer.driver = appuser.ID 
					LEFT JOIN vehicle
					ON transfer.vehicle = vehicle.ID
					WHERE transfer.status <> 'FINISHED'`).then(({result: transfers, fields}) => {
		console.log(transfers);
		res.status(200).json(transfers);
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong when fetching the transfers"});
	});
});

router.put("/updateTransfer", mustBeAdmin, function (req, res, next) {
	let {ID, person_name, num_of_people, origin, destination, time, driver, vehicle} = req.body;
	person_name = person_name.trim();
	origin = origin.trim();
	destination = destination.trim();
	console.log((vehicle !== null && !Number.isInteger(vehicle)));

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
	if (driver !== null && !Number.isInteger(driver) && driver <= 0) {
		res.status(400).json({err: "Driver validation error"});
		return;
	}
	if (vehicle !== null && !Number.isInteger(vehicle) && vehicle <= 0) {
		res.status(400).json({err: "Vehicle validation error"});
		return;
	}

	db.query(`UPDATE transfer 
				SET person_name = ?, num_of_people = ?, origin = ?, destination = ?, transfer_time = ?, driver = ?, vehicle = ?
				WHERE ID = ?`,
		[person_name, num_of_people, origin, destination, time, driver, vehicle, ID]).then(({result, fields}) => {
		res.status(200).json({res: "Transfer updated with success"});
	}).catch(err => {
		console.log(err);
		res.status(406).json({err: "Something went wrong with the query"});
	});
});

router.put("/updateActiveVehicle", mustBeAuthenticated, function (req, res, next) {
	let {vehicle} = req.body;

	db.query("UPDATE appuser SET activeVehicle = NULL WHERE activeVehicle = ?", [vehicle]).then(({result, fields}) => {
		console.log("Cleared previous owner of car successfully");
		db.query(`UPDATE appuser SET activeVehicle = ? WHERE ID = ?`, [vehicle, req.tokenPayload.ID]).then(({result, fields}) => {
			res.status(200).json({res: "Active vehicle updated with success"});
		}).catch(err => {
			console.log(err);
			res.status(406).json({err: "Something went wrong with the query"});
		});
		console.log("Hey");
	}).catch(err => {
		console.log(err);
		res.status(406).json({err: "Something went wrong with the query"});
	});
});

router.post("/addTransfer", mustBeAdmin, function (req, res, next) {
	let {person_name, num_of_people, origin, destination, datetime} = req.body;

	if (person_name && num_of_people && origin && destination && datetime) {
		db.query(`INSERT INTO 
						transfer(person_name, num_of_people, price, origin, destination, transfer_time, status, paid) 
						VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
			[person_name, num_of_people, 0, origin, destination, datetime, 'PENDING', true]
		).then(({result, fields}) => {
			res.status(200).json({res: "Transfer added successfully"});
		}).catch(err => {
			console.log(err);
			res.status(406).json({err: "Something went wrong with the query"});
		});
	} else {
		res.status(400).json({err: "Missing parameters"});
	}
});

router.delete("/removeTransfer/:ID", mustBeAdmin, function (req, res, next) {
	let ID = req.params.ID;

	if (ID) {
		db.query(`DELETE FROM transfer WHERE ID = ?`, [ID]).then(({result, fields}) => {
			res.status(200).json({res: "Transfer removed successfully"});
		}).catch(err => {
			console.log(err);
			res.status(406).json({err: "Something went wrong with the query"});
		});
	} else {
		res.status(400).json({err: "Missing parameters"});
	}
});

module.exports = router;