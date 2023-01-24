const express = require('express');
const router = express.Router();
const {verifyLoginCredentials, mustHaveSession} = require("../utils/authentication");
const db = require('../utils/db');
const bcrypt = require("bcrypt");
const {generateCSV} = require("../utils/csv-generator");
const {sendPushNotification} = require('../utils/PushNotificationManager');

const SALT_ROUNDS = 10;

// Index page
router.get("/", function (req, res) {
	res.render("index", {userID: req.session.userID, username: req.session.username});
});

// Login related routes
router.get("/login", function (req, res) {
	if (req.session.userID) {
		res.redirect("/admin");
		return;
	}

	res.render("login");
});

router.post("/login", function (req, res) {
	if (req.session.userID) {
		res.redirect("/admin");
		return;
	}

	if (!req.body.email || !req.body.password) {
		res.render("login", {
			errorMessage: "You left fields empty"
		});
		return;
	}

	verifyLoginCredentials(req.body.email, req.body.password, "ADMIN").then(result => {
		req.session.email = result.email;
		req.session.userID = result.ID;
		req.session.username = result.name;

		res.render("index", {userID: req.session.userID, username: req.session.username});
	}).catch(err => {
		console.log(err);
		res.render("login", {errorMessage: "Wrong credentials"});
	});
});

router.get("/logout", mustHaveSession, function (req, res) {
	req.session.destroy();
	res.redirect("/admin");
});

// Transfer routes
router.get("/transfers", mustHaveSession, function (req, res) {
	// Parsing and creating the SQL WHERE clause for time periods like "DAY", "WEEK" AND "MONTH"
	let timePeriodFilter = "";
	let queryVariables = [];

	// Parsing and creating the SQL WHERE clause for start and end dates
	let clauses = [];
	let clauseVariables = [];

	if (req.query.startDate) {
		clauses.push("transfer.transfer_time >= STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		clauseVariables.push(req.query.startDate);
	}

	if (req.query.endDate) {
		clauses.push("transfer.transfer_time < STR_TO_DATE(?, '%Y-%m-%dT%T.000Z')");
		clauseVariables.push(req.query.endDate);
	}

	if (clauses.length > 0) {
		timePeriodFilter = "WHERE " + clauses.join(" AND ");
		queryVariables.push(...clauseVariables);
	}

	db.query(`	SELECT transfer.ID, transfer.origin, transfer.destination, transfer.transfer_time, 
					transfer.person_name, transfer.num_of_people, transfer.status, transfer.seen, appuser.name AS driver
					FROM transfer
					LEFT JOIN appuser ON transfer.driver = appuser.ID
					${timePeriodFilter}
					ORDER BY transfer.transfer_time ${req.query.startDate || req.query.timePeriodFilter ? "ASC" : "DESC"}`, queryVariables).then(({result}) => {
		res.render("transfer/transfers", {
			userID: req.session.userID,
			username: req.session.username,
			transfers: result
		});
	}).catch(err => {
		console.log(err);
		res.redirect("/admin");
	});
});

router.get("/transfers/create", mustHaveSession, function (req, res) {
	let driverPromise = db.query("SELECT ID, name, commission, activeVehicle FROM appuser");
	let vehiclePromise = db.query("SELECT ID, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as name FROM vehicle");
	let operatorPromise = db.query("SELECT ID, name, commission FROM serviceoperator");

	Promise.all([driverPromise, vehiclePromise, operatorPromise]).then(results => {
		let driverRes = results[0];
		let vehicleRes = results[1];
		let operatorRes = results[2];

		res.render("transfer/transfer_create", {
			userID: req.session.userID,
			username: req.session.username,
			drivers: driverRes.result,
			vehicles: vehicleRes.result,
			operators: operatorRes.result
		});
	}).catch(err => {
		console.log(err);
		res.render("transfer/transfer_create", {
			userID: req.session.userID,
			username: req.session.username,
			errorMessage: "Something went wrong getting the drivers/vehicles/operators"
		});
	});
});

router.post("/transfers/create", mustHaveSession, function (req, res) {
	console.log(req.body.driverCommission)
	db.query(`INSERT INTO transfer(person_name, origin, destination, num_of_people, transfer_time, status, flight, price, paid, driver, vehicle, service_operator, observations, operatorCommission, driverCommission)
					VALUES(?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%dT%T.000Z'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[req.body.personName, req.body.origin, req.body.destination,
			req.body.numberOfPeople, req.body.datetime, req.body.status,
			req.body.flight, req.body.price, req.body.paid, req.body.driver === 'null' ? null : req.body.driver,
			req.body.vehicle === 'null' ? null : req.body.vehicle, req.body.operator === 'null' ? null : req.body.operator, req.body.observations, req.body.operatorCommission, req.body.driverCommission]).then(() => {
		res.redirect("/admin/transfers");

		if (req.body.driver !== "null") {
			db.query(`SELECT notificationToken FROM appuser WHERE ID = ?`, [req.body.driver]).then(({result: appuser}) => {
				sendPushNotification(appuser[0].notificationToken, "You have a new trip");
			});
		}
	}).catch(err => {
		console.log(err);
		res.json(err);
	});
});

router.get("/transfers/update/:id", mustHaveSession, function (req, res) {
	let driverPromise = db.query("SELECT ID, name, commission, activeVehicle FROM appuser");
	let vehiclePromise = db.query("SELECT ID, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as name FROM vehicle");
	let operatorPromise = db.query("SELECT ID, name, commission FROM serviceoperator");

	Promise.all([driverPromise, vehiclePromise, operatorPromise]).then(results => {
		let driverRes = results[0];
		let vehicleRes = results[1];
		let operatorRes = results[2];

		db.query("SELECT * FROM transfer WHERE ID = ?", [req.params.id]).then(({result}) => {
			res.render("transfer/transfer_update", {
				ID: req.params.id,
				userID: req.session.userID,
				username: req.session.username,
				drivers: driverRes.result,
				vehicles: vehicleRes.result,
				operators: operatorRes.result,
				transfer: result[0]
			});
		}).catch(err => {
			console.log(err);
			res.json(err);
		});
	}).catch(err => {
		console.log(err);
		res.redirect("/admin/transfers");
	});
});

router.post("/transfers/update/:id", mustHaveSession, function (req, res) {
	console.log(req.body.operator);
	if (req.body.operator === "null") req.body.operator = null;
	if (req.body.driver === "null") req.body.driver = null;
	if (req.body.vehicle === "null") req.body.vehicle = null;

	db.query(`SELECT driver from transfer WHERE ID = ?`, [req.params.id]).then(({result: transfer}) => {
		db.query(`UPDATE transfer SET person_name = ?, origin = ?, destination = ?, num_of_people = ?, 
					transfer_time = STR_TO_DATE(?, '%Y-%m-%dT%T.000Z'), status = ?, flight = ?, price = ?, paid = ?, vehicle = ?, 
					operatorCommission = IF(service_operator = ?, operatorCommission, ?), service_operator = ?, observations = ?,
				 	driverCommission = IF(driver = ?, driverCommission, ?), driver = ?, seen = IF(driver = ?, seen, 0)
					WHERE ID = ?`,
			[req.body.person_name, req.body.origin, req.body.destination, req.body.num_of_people,
				req.body.datetime, req.body.status, req.body.flight, req.body.price, req.body.paid, req.body.vehicle,
				req.body.operator, req.body.operatorCommission, req.body.operator, req.body.observations,
				req.body.driver, req.body.driverCommission, req.body.driver, req.body.driver, req.params.id]).then(() => {
			res.redirect("/admin/transfers");

			if (parseInt(transfer[0].driver) !== parseInt(req.body.driver) && req.body.driver !== null) {
				db.query(`SELECT notificationToken FROM appuser WHERE ID = ?`, [req.body.driver]).then(({result: appuser}) => {
					sendPushNotification(appuser[0].notificationToken, "You have a new trip");
				});
			}
		}).catch(err => console.log(err));
	}).catch(err => console.log(err));
});

router.get("/transfers/details/:id", mustHaveSession, function (req, res) {
	db.query(`SELECT 
					transfer.ID, transfer.person_name, transfer.num_of_people, transfer.origin, transfer.destination,
				 	transfer.transfer_time, transfer.status, transfer.flight, transfer.price, transfer.operatorCommission, transfer.driverCommission, transfer.paid,
				 	transfer.observations, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicle,
				 	appuser.name as driver, serviceoperator.name as service_operator, transfer.seen
					FROM transfer
					LEFT JOIN serviceoperator ON transfer.service_operator = serviceoperator.ID
					LEFT JOIN appuser ON transfer.driver = appuser.ID
					LEFT JOIN vehicle ON transfer.vehicle = vehicle.ID
					WHERE transfer.ID = ?`, [req.params.id]).then(({result}) => {
		res.render("transfer/transfer_details", {
			userID: req.session.userID,
			username: req.session.username,
			transfer: result[0]
		});
	}).catch(err => {
		console.log(err);
		res.redirect("/admin");
	});
});

router.get("/transfers/delete/:id", mustHaveSession, function (req, res) {
	res.render("transfer/transfer_delete", {
		ID: req.params.id,
		userID: req.session.userID,
		username: req.session.username
	});
});

router.post("/transfers/delete", mustHaveSession, function (req, res) {
	if (!req.body.id) {
		res.status(400).redirect("/admin/transfers");
		return;
	}

	db.query("DELETE FROM transfer WHERE ID = ?", [req.body.id]).then(() => {
	}).catch(err => {
		console.log(err);
	}).finally(() => {
		res.redirect("/admin/transfers");
	});
});

// Vehicle routes
router.get("/vehicles", mustHaveSession, function (req, res) {
	db.query("SELECT ID, brand, license_plate, name, nickname, seat_number, status FROM vehicle").then(({result}) => {
		res.render("vehicle/vehicles", {
			userID: req.session.userID,
			username: req.session.username,
			vehicles: result
		});
	}).catch(err => {
		console.log(err);
		res.redirect("/admin");
	});
});

router.get("/vehicles/create", mustHaveSession, function (req, res) {
	res.render("vehicle/vehicle_create", {
		userID: req.session.userID,
		username: req.session.username,
	});
});

router.post("/vehicles/create", mustHaveSession, function (req, res) {
	if (!req.body.brand || !req.body.name || !req.body.license_plate || !req.body.seat_number || !req.body.status) {
		res.redirect("/admin/vehicles");
		return;
	}

	db.query("INSERT INTO vehicle(brand, license_plate, name, seat_number, status) VALUES (?, ?, ?, ?, ?)",
		[req.body.brand, req.body.license_plate, req.body.name, req.body.seat_number, req.body.status]).then(() => {
		res.redirect("/admin/vehicles");
	}).catch(err => {
		console.log(err);
	});
});

router.get("/vehicles/update/:id", mustHaveSession, function (req, res) {
	db.query("SELECT brand, license_plate, name, seat_number, status FROM vehicle WHERE ID = ?", [req.params.id]).then(({result}) => {
		res.render("vehicle/vehicle_update", {
			ID: req.params.id,
			userID: req.session.userID,
			username: req.session.username,
			vehicle: result[0]
		});
	}).catch(err => {
		console.log(err);
	});
});

router.post("/vehicles/update/:id", mustHaveSession, function (req, res) {
	db.query("UPDATE vehicle SET brand = ?, license_plate = ?, name = ?, seat_number = ?, status = ? WHERE ID = ?", [req.body.brand, req.body.license_plate, req.body.name, req.body.seat_number, req.body.status, req.params.id]).then(({result}) => {
		res.redirect("/admin/vehicles")
	}).catch(err => {
		console.log(err);
	});
});

router.get("/vehicles/delete/:id", mustHaveSession, function (req, res) {
	res.render("vehicle/vehicle_delete", {
		ID: req.params.id,
		userID: req.session.userID,
		username: req.session.username
	});
});

router.post("/vehicles/delete", mustHaveSession, function (req, res) {
	if (!req.body.id) {
		res.status(400).redirect("/admin/vehicles");
		return;
	}

	db.query("DELETE FROM vehicle WHERE ID = ?", [req.body.id]).then(() => {
	}).catch(err => {
		console.log(err);
	}).finally(() => {
		res.redirect("/admin/vehicles");
	});
});

// Appuser routes
router.get("/appusers", mustHaveSession, function (req, res) {
	db.query(`SELECT 
					appuser.ID, appuser.name, appuser.email, appuser.birthday, appuser.commission, 
					CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicle,
					usertype.user_type as userType
					FROM appuser 
					LEFT JOIN vehicle ON appuser.activeVehicle = vehicle.ID
					INNER JOIN usertype ON appuser.userType = usertype.ID`).then(({result}) => {
		res.render("appuser/appusers", {
			userID: req.session.userID,
			username: req.session.username,
			users: result
		});
	}).catch(err => {
		console.log(err);
		res.redirect("/admin");
	});
});

router.get("/appusers/create", mustHaveSession, function (req, res) {
	res.render("appuser/appuser_create", {
		userID: req.session.userID,
		username: req.session.username
	});
});

router.post("/appusers/create", mustHaveSession, function (req, res) {
	if (!req.body.email || !req.body.name || !req.body.birthday || !req.body.userType || !req.body.password || !req.body.confirmPassword || !req.body.commission) {
		res.redirect("/admin");
		return;
	}

	if (req.body.password !== req.body.confirmPassword) {
		res.redirect("/admin");
		return;
	}

	bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hash) {
		db.query(`INSERT INTO appuser(email, password, name, birthday, userType, commission) 
					VALUES (?, ?, ?, ?, ?, ?)`, [req.body.email, hash, req.body.name, req.body.birthday, req.body.userType, req.body.commission / 100]).then(() => {
			res.redirect("/admin/appusers");
		}).catch(err => {
			console.log(err);
			res.redirect("/admin/appusers");
		});
	});
});

router.get("/appusers/update/:id", mustHaveSession, function (req, res) {
	db.query("SELECT email, name, birthday, userType, commission FROM appuser WHERE ID = ?", [req.params.id]).then(({result}) => {
		res.render("appuser/appuser_update", {
			ID: req.params.id,
			userID: req.session.userID,
			username: req.session.username,
			appuser: result[0]
		});
	}).catch(err => {
		console.log(err);
	});
});

router.post("/appusers/update/:id", mustHaveSession, function (req, res) {
	db.query("UPDATE appuser SET email = ?, name = ?, birthday = ?, userType = ?, commission = ? WHERE ID = ?", [req.body.email, req.body.name, req.body.birthday, req.body.userType, req.body.commission / 100, req.params.id]).then(() => {
		res.redirect("/admin/appusers");
	}).catch(err => {
		console.log(err);
	});
});

router.get("/appusers/changePassword/:id", mustHaveSession, function (req, res) {
	res.render("appuser/appuser_changepassword", {
		ID: req.params.id,
		userID: req.session.userID,
		username: req.session.username
	});
});

router.post("/appusers/changePassword/:id", mustHaveSession, function (req, res) {
	if (req.body.password !== req.body.confirmPassword) {
		res.redirect("/admin");
		return;
	}

	bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hash) {
		db.query(`UPDATE appuser SET password = ? WHERE ID = ?`, [hash, req.params.id]).then(() => {
			res.redirect("/admin/appusers");
		}).catch(err => {
			console.log(err);
			res.redirect("/admin/appusers");
		});
	});
});

router.get("/appusers/delete/:id", mustHaveSession, function (req, res) {
	res.render("appuser/appuser_delete", {
		ID: req.params.id,
		userID: req.session.userID,
		username: req.session.username
	});
});

router.post("/appusers/delete", mustHaveSession, function (req, res) {
	if (!req.body.id) {
		res.status(400).redirect("/admin/appusers");
		return;
	}

	db.query("DELETE FROM appuser WHERE ID = ?", [req.body.id]).then(() => {
	}).catch(err => {
		console.log(err);
	}).finally(() => {
		res.redirect("/admin/appusers");
	});
});

// operator routes
router.get("/operators", mustHaveSession, function (req, res) {
	db.query(`SELECT ID, name, commission FROM serviceoperator`).then(({result}) => {
		res.render("operator/operators", {
			userID: req.session.userID,
			username: req.session.username,
			operators: result
		});
	}).catch(err => {
		console.log(err);
		res.redirect("/admin");
	});
});

router.get("/operators/create", mustHaveSession, function (req, res) {
	res.render("operator/operator_create", {
		userID: req.session.userID,
		username: req.session.username,
	});
});

router.post("/operators/create", mustHaveSession, function (req, res) {
	if (!req.body.name || !req.body.commission) {
		res.redirect("/admin/operators");
		return;
	}

	db.query("INSERT INTO serviceoperator(name, commission) VALUES (?, ?)", [req.body.name, req.body.commission / 100]).then(() => {
		res.redirect("/admin/operators");
	}).catch(err => {
		console.log(err);
	});
});

router.get("/operators/update/:id", mustHaveSession, function (req, res) {
	db.query("SELECT name, commission FROM serviceoperator WHERE ID = ?", [req.params.id]).then(({result}) => {
		res.render("operator/operator_update", {
			ID: req.params.id,
			userID: req.session.userID,
			username: req.session.username,
			operator: result[0]
		});
	});
});

router.post("/operators/update/:id", mustHaveSession, function (req, res) {
	db.query("UPDATE serviceoperator SET name = ?, commission = ? WHERE ID = ?", [req.body.name, req.body.commission / 100, req.params.id]).then(() => {
		res.redirect("/admin/operators");
	}).catch(err => {
		console.log(err);
	});
});

router.get("/operators/delete/:id", mustHaveSession, function (req, res) {
	res.render("operator/operator_delete", {
		ID: req.params.id,
		userID: req.session.userID,
		username: req.session.username
	});
});

router.post("/operators/delete", mustHaveSession, function (req, res) {
	if (!req.body.id) {
		res.status(400).redirect("/admin/operators");
		return;
	}

	db.query("DELETE FROM serviceoperator WHERE ID = ?", [req.body.id]).then(() => {
	}).catch(err => {
		console.log(err);
	}).finally(() => {
		res.redirect("/admin/operators");
	});
});

router.get("/commissions", mustHaveSession, function (req, res) {
	let driverPromise = db.query("SELECT ID, name, commission, activeVehicle FROM appuser");
	let operatorPromise = db.query("SELECT ID, name, commission FROM serviceoperator");

	Promise.all([driverPromise, operatorPromise]).then(results => {
		let drivers = results[0].result;
		let operators = results[1].result;

		db.query("SELECT ID, name FROM appuser").then(({result: drivers}) => {
			if (req.query.startDate && req.query.endDate) {
				let clauseValues = [];

				if (req.query.driver !== "null") {
					clauseValues.push(req.query.driver);
				}

				if (req.query.operator !== "null") {
					clauseValues.push(req.query.operator);
				}

				db.query(`SELECT
						transfer.ID,
						transfer.driver,
						appuser.name AS driverName,
						serviceoperator.name AS operatorName,
						transfer.origin,
						transfer.destination,
						transfer.transfer_time,
						transfer.price,
						transfer.operatorCommission,
						transfer.operatorCommission * transfer.price AS operatorCommissionValue,
						transfer.driverCommission,
						transfer.driverCommission * (transfer.price - transfer.operatorCommission * transfer.price) AS driverCommissionValue
						FROM transfer
						LEFT JOIN appuser ON transfer.driver = appuser.ID
						LEFT JOIN serviceoperator ON transfer.service_operator = serviceoperator.ID
						WHERE transfer_time BETWEEN ? AND ?
						${req.query.driver === "null" ? "" : " AND transfer.driver = ?"}
						${req.query.operator === "null" ? "" : " AND transfer.service_operator = ?"}`,
					[req.query.startDate, req.query.endDate, ...clauseValues]).then(({result}) => {
					res.render("commission/commissions", {
						ID: req.params.id,
						userID: req.session.userID,
						username: req.session.username,
						commissions: result,
						operators: operators,
						currentOperator: req.query.operator,
						drivers: drivers,
						currentDriver: req.query.driver,
						startDate: req.query.startDate,
						endDate: req.query.endDate,
					});
				}).catch(err => {
					console.log(err);
				});
			} else {
				res.render("commission/commissions", {
					ID: req.params.id,
					userID: req.session.userID,
					username: req.session.username,
					operators: operators,
					drivers: drivers
				});
			}
		});
	});
});

router.post("/genTransferCSV", mustHaveSession, function (req, res, next) {
	console.log(req.body)

	let queryConditions = [];
	if (req.body.startDate !== "") {
		queryConditions.push(`transfer.transfer_time >= CAST('${req.body.startDate}' AS DATE)`);
	}
	if (req.body.endDate !== "") {
		queryConditions.push(`transfer.transfer_time <= CAST('${req.body.endDate}' AS DATE)`);
	}

	if (req.body.driver !== "null") {
		queryConditions.push(`transfer.driver = ${req.body.driver}`);
	}
	if (req.body.operator !== "null") {
		queryConditions.push(`transfer.service_operator = ${req.body.operator}`);
	}

	db.query(`SELECT
				transfer.ID AS "Transfer Number", 
				transfer.person_name AS "Person Name",
				transfer.num_of_people AS "Number of People",
				transfer.flight AS "Flight",
				transfer.origin AS "Origin",
				transfer.destination AS "Destination",
				DATE_FORMAT(transfer.transfer_time, '%d/%m/%Y %T') AS "Transfer Time",
				transfer.status AS "Status",
				appuser.name AS "Driver",
				CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')' ) AS "Vehicle",
				serviceoperator.name AS "Operator",
				transfer.price AS "Price",
				transfer.paid AS "Is Paid",
				transfer.observations AS "Observations"
				FROM transfer
				LEFT JOIN appuser ON transfer.driver = appuser.ID
				LEFT JOIN vehicle ON transfer.vehicle = vehicle.ID
				LEFT JOIN serviceoperator ON transfer.service_operator = serviceoperator.ID 
				${queryConditions.length > 0 ? " WHERE " + queryConditions.join(" AND ") : ""}`)
		.then(({result, fields}) => {
			res.set('Content-Disposition', 'attachment; filename=export.csv').send(generateCSV(result, fields));
		}).catch(err => {
		console.log(err);
	});
});

router.get("/genCommissionCSV", mustHaveSession, function (req, res, next) {
	let clauseValues = [];

	if (req.query.driver !== "null") {
		clauseValues.push(req.query.driver);
	}

	if (req.query.operator !== "null") {
		clauseValues.push(req.query.operator);
	}


	db.query(`SELECT
				transfer.ID,
				appuser.name AS Driver,
				serviceoperator.name AS Operator,
				transfer.origin AS Origin,
				transfer.destination AS Destination,
				DATE_FORMAT(transfer.transfer_time, '%d/%m/%Y %T') AS "Transfer Time",
				transfer.price AS Price,
				ROUND(transfer.operatorCommission * 100, 2) AS "Operator Commission %",
				ROUND(transfer.operatorCommission * transfer.price, 2) AS "Operator Commission €",
				ROUND(transfer.driverCommission * 100, 2) AS "Driver Commission %",
				ROUND(transfer.driverCommission * (transfer.price - transfer.operatorCommission * transfer.price), 2) AS "Driver Commission €"
				FROM transfer
				INNER JOIN appuser ON transfer.driver = appuser.ID
				INNER JOIN serviceoperator ON transfer.service_operator = serviceoperator.ID
				WHERE transfer_time BETWEEN ? AND ?
				${req.query.driver === "null" ? "" : " AND transfer.driver = ?"}
				${req.query.operator === "null" ? "" : " AND transfer.service_operator = ?"}`,
		[req.query.startDate, req.query.endDate, ...clauseValues]).then(({result, fields}) => {
		console.log(result);
		res.set('Content-Disposition', 'attachment; filename=export.csv').send(generateCSV(result, fields));
	}).catch(err => {
		console.log(err);
	});
});

module.exports = router;