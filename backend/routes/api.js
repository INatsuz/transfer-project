const express = require('express');
const router = express.Router();
const {mustBeAuthenticated, mustBeAdmin} = require("../utils/authentication");
const db = require('../utils/db');

// GET getVehicles
router.get("/getAllTransfers", mustBeAdmin, function (req, res, next) {
	db.query(`SELECT transfer.*, appuser.name as driverName, serviceoperator.name as operatorName, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')' ) as vehicleName
					FROM transfer
					LEFT JOIN appuser
					ON transfer.driver = appuser.ID
					LEFT JOIN serviceoperator
					ON transfer.service_operator = serviceoperator.ID
					LEFT JOIN vehicle
					ON transfer.vehicle = vehicle.ID
					`).then(({result: transfers}) => {
		res.status(200).json({transfers: transfers});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong when fetching the transfers"});
	});
});

// GET getAssignedJobs
router.get("/getAssignedTransfers", mustBeAuthenticated, function (req, res, next) {
	db.query(`SELECT transfer.*, appuser.name as driverName, serviceoperator.name as operatorName, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName
					FROM transfer 
					INNER JOIN appuser
					ON transfer.driver = appuser.ID
					LEFT JOIN serviceoperator
					ON transfer.service_operator = serviceoperator.ID
					LEFT JOIN vehicle
					ON transfer.vehicle = vehicle.ID
					WHERE transfer.status <> 'FINISHED'
					AND appuser.ID = ?;`, [req.tokenPayload.ID]).then(({result: transfers}) => {
		if (transfers) {
			res.status(200).json({transfers: transfers});
		}
	}).catch(err => {
		console.log(err);
		console.log("Something went wrong getting assigned jobs");
	});
});

// GET getDrivers
router.get("/getDrivers", mustBeAdmin, function (req, res, next) {
	db.query(`SELECT appuser.ID, appuser.name, appuser.activeVehicle, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName 
			FROM appuser 
			LEFT JOIN vehicle 
			ON vehicle.ID = appuser.activeVehicle`, []).then(({result: drivers}) => {
		res.status(200).json({drivers: drivers});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
	});
});

// GET getOperators
router.get("/getOperators", mustBeAdmin, function (req, res, next) {
	db.query(`SELECT ID, name FROM serviceoperator`, []).then(({result: operators}) => {
		res.status(200).json({operators: operators});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
	});
});

// GET getVehicles
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

// PUT updateTransfer
router.put("/updateTransfer", mustBeAdmin, function (req, res, next) {
	let {
		ID,
		person_name,
		num_of_people,
		flight,
		origin,
		destination,
		price,
		time,
		driver,
		vehicle,
		operator,
		observations
	} = req.body;
	person_name = person_name.trim();
	origin = origin.trim();
	destination = destination.trim();
	num_of_people = parseInt(num_of_people);
	flight = flight.toUpperCase();

	if (!Number.isInteger(ID) || ID <= 0) {
		res.status(400).json({err: "ID validation error"});
		return;
	}
	if (!person_name || person_name.length <= 0 || person_name.length > 128 || typeof (person_name) !== "string") {
		res.status(400).json({err: "Person name validation error"});
		return;
	}
	if (isNaN(num_of_people) || num_of_people <= 0 || num_of_people >= 100) {
		console.log("Number of people validation error");
		console.log("Number of people: " + num_of_people);
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

	db.query(`SELECT driver FROM transfer`).then(({result: transfer, fields}) => {
		db.query(`UPDATE transfer 
				SET person_name = ?, num_of_people = ?, flight = ?, origin = ?, destination = ?, price = ?, transfer_time = ?, driver = ?, vehicle = ?, service_operator = ?, observations = ?
				WHERE ID = ?`,
			[person_name, num_of_people, flight, origin, destination, price, time, driver, vehicle, operator, observations, ID]).then(() => {
			res.status(200).json({res: "Transfer updated with success"});
		}).catch(err => {
			console.log(err);
			res.status(406).json({err: "Something went wrong with the query"});
		});
	});
});

// PUT updateTransferStatus
router.put("/updateTransferStatus", mustBeAuthenticated, function (req, res, next) {
	let {ID, status} = req.body;

	db.query("UPDATE transfer SET status = ? WHERE ID = ?", [status, ID]).then(() => {
		res.status(200).json({res: "Transfer status updated successfully"});
	}).catch(err => {
		console.log(err);
		res.status(406).json({err: "Something went wrong with the query"});
	});
});

// PUT updateActiveVehicle
router.put("/updateActiveVehicle", mustBeAuthenticated, function (req, res, next) {
	let {vehicle} = req.body;

	db.query("UPDATE appuser SET activeVehicle = NULL WHERE activeVehicle = ?", [vehicle]).then(() => {
		db.query(`UPDATE appuser SET activeVehicle = ? WHERE ID = ?`, [vehicle, req.tokenPayload.ID]).then(() => {
			res.status(200).json({res: "Active vehicle updated with success"});
		}).catch(err => {
			console.log(err);
			res.status(406).json({err: "Something went wrong with the query"});
		});
	}).catch(err => {
		console.log(err);
		res.status(406).json({err: "Something went wrong with the query"});
	});
});


// TODO Add logic to send push notification
// POST addTransfer
router.post("/addTransfer", mustBeAdmin, function (req, res, next) {
	let {person_name, num_of_people, price, origin, destination, flight, datetime, operator, observations} = req.body;

	if (person_name && num_of_people && origin && destination && datetime) {
		db.query(`INSERT INTO 
						transfer(person_name, num_of_people, price, origin, destination, flight, transfer_time, service_operator, observations, status, paid) 
						VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[person_name, num_of_people, price, origin, destination, flight, datetime, operator, observations, 'PENDING', true]
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


// DELETE removeTransfer/:ID
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