const express = require('express');
const router = express.Router();
const {mustBeAuthenticated, mustBeAdmin, USER_TYPES} = require("../utils/authentication");
const db = require('../utils/db');
const {sendPushNotification} = require("../utils/PushNotificationManager");

// GET getAllTransfers
router.get("/getAllTransfers", mustBeAdmin, function (req, res, next) {
	let {startDate, endDate} = req.query;

	let clauses = [];
	let queryVariables = [];

	let queryFilter = "";

	if (startDate) {
		clauses.push("transfer.transfer_time >= STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		queryVariables.push(req.query.startDate);
	}

	if (endDate) {
		clauses.push("transfer.transfer_time < STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		queryVariables.push(req.query.endDate);
	}

	if (clauses.length > 0) {
		queryFilter = "WHERE " + clauses.join(" AND ");
	}

	db.query(`SELECT transfer.*, appuser.name as driverName, appuser.color, serviceoperator.name as operatorName, serviceoperator.color as operatorColor, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')' ) as vehicleName
					FROM transfer
					LEFT JOIN appuser
					ON transfer.driver = appuser.ID
					LEFT JOIN serviceoperator
					ON transfer.service_operator = serviceoperator.ID
					LEFT JOIN vehicle
					ON transfer.vehicle = vehicle.ID
					${queryFilter}
					ORDER BY transfer.transfer_time ${startDate ? "ASC" : "DESC"}
					`, [...queryVariables]).then(({result: transfers}) => {
		res.status(200).json({transfers: transfers});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong when fetching the transfers"});
	});
});

// GET getAssignedJobs
router.get("/getAssignedTransfers", mustBeAuthenticated, function (req, res, next) {
	let {startDate, endDate} = req.query;

	let clauses = [];
	let queryVariables = [];

	let queryFilter = "";

	if (startDate) {
		clauses.push("transfer.transfer_time >= STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		queryVariables.push(startDate);
	}

	if (endDate) {
		clauses.push("transfer.transfer_time < STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		queryVariables.push(endDate);
	}

	if (clauses.length > 0) {
		queryFilter = "AND " + clauses.join(" AND ");
	}

	db.query(`SELECT transfer.*, appuser.name as driverName, appuser.color, serviceoperator.name as operatorName, serviceoperator.color as operatorColor, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName
					FROM transfer 
					INNER JOIN appuser
					ON transfer.driver = appuser.ID
					LEFT JOIN serviceoperator
					ON transfer.service_operator = serviceoperator.ID
					LEFT JOIN vehicle
					ON transfer.vehicle = vehicle.ID
					WHERE appuser.ID = ?
					${queryFilter}
					ORDER BY transfer.transfer_time ASC`, [req.tokenPayload.ID, ...queryVariables]).then(({result: transfers}) => {
		if (transfers) {
			res.status(200).json({transfers: transfers});
		} else {
			res.status(406).json({error: "Something went wrong with the getAssignedTransfers API endpoint."});
		}
	}).catch(err => {
		console.log(err);
		console.log("Something went wrong getting assigned jobs");
	});
});

router.get("/searchTransfers", mustBeAuthenticated, function (req, res) {
	let {startDate, endDate, name} = req.query;

	let clauses = [];
	let queryVariables = [];

	let queryFilter = "";

	console.log(name);

	if (name && name !== "undefined") {
		clauses.push("transfer.person_name LIKE ?");
		queryVariables.push(`%${req.query.name}%`);
	}

	if (startDate && startDate !== "undefined") {
		clauses.push("transfer.transfer_time >= STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		queryVariables.push(startDate);
	}

	if (endDate && endDate !== "undefined") {
		clauses.push("transfer.transfer_time < STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		queryVariables.push(endDate);
	}

	if (clauses.length > 0) {
		queryFilter = "WHERE " + clauses.join(" AND ");
	}

	console.log(queryFilter);

	db.query(`	SELECT transfer.*, appuser.name as driverName, appuser.color, serviceoperator.name as operatorName, serviceoperator.color as operatorColor, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName
					FROM transfer 
					LEFT JOIN appuser
					ON transfer.driver = appuser.ID
					LEFT JOIN serviceoperator
					ON transfer.service_operator = serviceoperator.ID
					LEFT JOIN vehicle
					ON transfer.vehicle = vehicle.ID
					${queryFilter}
					${req.tokenPayload.userType === USER_TYPES.DRIVER ? " AND (transfer.driver IS NULL OR transfer.driver = ?)" : ""}
					ORDER BY transfer.transfer_time ${startDate && startDate !== "undefined" ? "ASC" : "DESC"}`, [...queryVariables, ...(req.tokenPayload.userType === USER_TYPES.DRIVER ? [req.tokenPayload.ID] : [])]).then(({result: transfers}) => {
		if (transfers) {
			res.status(200).json({transfers: transfers});
		} else {
			res.status(406).json({error: "Something went wrong with the getAssignedTransfers API endpoint."});
		}
	}).catch(err => {
		console.log(err);
		console.log("Something went wrong getting assigned jobs");
	});
});

// GET getDrivers
router.get("/getDrivers", mustBeAuthenticated, function (req, res, next) {
	db.query(`SELECT appuser.ID, appuser.name, appuser.userType, appuser.activeVehicle, appuser.commission, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicleName 
			FROM appuser 
			LEFT JOIN vehicle 
			ON vehicle.ID = appuser.activeVehicle
			WHERE appuser.userType = ? OR appuser.userType = ?`, [USER_TYPES.ADMIN, USER_TYPES.DRIVER]).then(({result: drivers}) => {
		res.status(200).json({drivers: drivers});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
	});
});

// GET getOperators
router.get("/getOperators", mustBeAuthenticated, function (req, res, next) {
	db.query(`SELECT ID, name, commission, color FROM serviceoperator`, []).then(({result: operators}) => {
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
				ORDER BY userID DESC;`).then(({result: vehicles}) => {
		res.status(200).json({vehicles: vehicles});
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
	})
});

// PUT updateTransfer
router.put("/updateTransfer", mustBeAuthenticated, function (req, res, next) {
	let {
		ID,
		person_name,
		num_of_people,
		flight,
		origin,
		destination,
		price,
		paid,
		paymentMethod,
		time,
		driver,
		driverCommission,
		vehicle,
		operator,
		operatorCommission,
		observations
	} = req.body;
	person_name = person_name.trim();
	origin = origin.trim();
	destination = destination.trim();
	num_of_people = num_of_people.trim();
	flight = flight.toUpperCase();
	observations = observations.trim()

	if (!Number.isInteger(ID) || ID <= 0) {
		res.status(400).json({err: "ID validation error"});
		return;
	}

	if (!person_name || person_name.length <= 0 || person_name.length > 128 || typeof (person_name) !== "string") {
		res.status(400).json({err: "Person name validation error"});
		console.log("Person name validation error");
		return;
	}

	if (!origin || origin.length <= 0 || origin.length > 128 || typeof (origin) !== "string") {
		res.status(400).json({err: "Origin validation error"});
		console.log("Origin validation error");
		return;
	}

	if (!destination || destination.length <= 0 || destination.length > 128 || typeof (destination) !== "string") {
		res.status(400).json({err: "Destination validation error"});
		console.log("Destination validation error");
		return;
	}

	if (!time || !Date.parse(time)) {
		res.status(400).json({err: "Time validation error"});
		console.log("Time validation error")
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

	let previousDriver;

	db.query(`SELECT transfer.driver FROM transfer WHERE transfer.ID = ?`, [ID]).then(({result}) => {
		if (result && result[0]) {
			previousDriver = result[0].driver;
		}
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
	});

	db.query(`UPDATE transfer 
				SET person_name = ?, num_of_people = ?, flight = ?, origin = ?, destination = ?, price = ?, paid = ?, seen = IF(driver = ?, seen, 0), payment_method = ?, transfer_time = ?, driverCommission = IF(driver = ?, driverCommission, ?), operatorCommission = IF(service_operator = ?, operatorCommission, ?), driver = ?, vehicle = ?, service_operator = ?, observations = ?
				WHERE ID = ?`,
		[person_name, num_of_people, flight, origin, destination, price, paid, driver, paymentMethod ?? null, time, driver ?? null, driverCommission, operator ?? null, operatorCommission, driver ?? null, vehicle ?? null, operator ?? null, observations, ID]).then(() => {
		res.status(200).json({res: "Transfer updated with success"});

		if (driver && driver !== previousDriver && driver !== req.tokenPayload.ID) {
			db.query(`SELECT ID, notificationToken FROM appuser WHERE ID = ?`, [driver]).then(({result}) => {
				if (result[0].notificationToken) {
					sendPushNotification(result[0].notificationToken, "You have a new service");
				}
			}).catch(err => {
				console.log(err);
			});
		}
	}).catch(err => {
		console.log(err);
		res.status(400).json({err: "Something went wrong with the query"});
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

// PUT markAsSeen
// Mark a transfer as seen so the admin can track if the driver has opened and acknowledged the transfer
router.put("/markAsSeen", mustBeAuthenticated, function (req, res) {
	let {ID} = req.body;

	db.query("SELECT driver FROM transfer WHERE ID = ?", [ID]).then(({result: transfer}) => {
		if (transfer[0].driver === req.tokenPayload.ID) {
			db.query("UPDATE transfer SET seen = 1 WHERE ID = ?", [ID]).then(() => {
				console.log("Marked transfer with ID: " + ID + " as seen");
				res.status(200).json({res: "Transfer marked as seen successfully"});
			}).catch(err => {
				console.log(err);
				res.status(406).json({err: "Couldn't update the transfer to seen"});
			});
		} else {
			console.log("Not the driver assigned to the transfer");
			res.status(406).json({err: "Not the driver assigned to the transfer"});
		}
	}).catch(err => {
		console.log(err);
		console.log("Couldn't find a transfer to mark as seen");
		res.status(406).json({err: "Couldn't find the transfer to mark as seen"});
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


// POST addTransfer
router.post("/addTransfer", mustBeAuthenticated, function (req, res, next) {
	let {
		person_name,
		num_of_people,
		price,
		paid,
		paymentMethod,
		origin,
		destination,
		flight,
		datetime,
		status,
		driver,
		driverCommission,
		vehicle,
		operator,
		operatorCommission,
		observations
	} = req.body;

	if (person_name && num_of_people && price !== undefined && paid !== undefined && origin && destination && flight !== undefined && datetime && status && observations !== undefined) {
		db.query(`INSERT INTO 
						transfer(person_name, num_of_people, price, paid, payment_method, origin, destination, flight, transfer_time, status, driver, vehicle, service_operator, observations, driverCommission, operatorCommission, createdBy) 
						VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[person_name, num_of_people, price, paid, paymentMethod ?? null, origin, destination, flight, datetime, status, driver ?? null, vehicle ?? null, operator ?? null, observations, driverCommission, operatorCommission, req.tokenPayload.ID]
		).then(({result, fields}) => {
			res.status(200).json({res: "Transfer added successfully"});

			if (driver) {
				if (driver !== req.tokenPayload.ID) {
					db.query(`SELECT ID, notificationToken FROM appuser WHERE ID = ?`, [driver]).then(({result}) => {
						if (result[0].notificationToken) {
							sendPushNotification(result[0].notificationToken, "You have a new service");
						}
					}).catch(err => {
						console.log(err);
					});
				}
			}
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
