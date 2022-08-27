const express = require('express');
const router = express.Router();
const {verifyLoginCredentials, mustHaveSession} = require("../utils/authentication");
const db = require('../utils/db');
const bcrypt = require("bcrypt");
const {generateCSV} = require("../utils/csv-generator");

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
		res.status(400).json({err: "Bad request"});
		return;
	}

	verifyLoginCredentials(req.body.email, req.body.password, "ADMIN").then(result => {
		req.session.email = result.email;
		req.session.userID = result.ID;
		req.session.username = result.name;

		res.status(200);
	}).catch(err => {
		console.log(err);
		res.status(401);
	}).finally(() => {
		res.render("index", {userID: req.session.userID, username: req.session.username});
	});
});

router.get("/logout", mustHaveSession, function (req, res) {
	req.session.destroy();
	res.redirect("/admin");
});

// Transfer routes
router.get("/transfers", mustHaveSession, function (req, res) {
	db.query("SELECT ID, origin, destination, transfer_time, person_name, num_of_people FROM transfer").then(({result}) => {
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
	let driverPromise = db.query("SELECT ID, name, activeVehicle FROM appuser");
	let vehiclePromise = db.query("SELECT ID, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as name FROM vehicle");
	let operatorPromise = db.query("SELECT ID, name FROM serviceoperator");

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
		res.redirect("/admin/transfers");
	});
});

//TODO Figure out timezone issues
router.post("/transfers/create", mustHaveSession, function (req, res) {
	console.log(req.body.isPaid);

	db.query(`INSERT INTO transfer(person_name, origin, destination, num_of_people, transfer_time, status, flight, price, paid, driver, vehicle, service_operator, observations)
					VALUES(?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%dT%T.000Z'), ?, ?, ?, ?, ?, ?, ?, ?)`,
		[req.body.personName, req.body.origin, req.body.destination,
			req.body.numberOfPeople, req.body.datetime, req.body.status,
			req.body.flight, req.body.price, req.body.isPaid === "on", req.body.driver,
			req.body.vehicle, req.body.operator, req.body.observations]).then(() => {
		res.redirect("/admin/transfers");
	}).catch(err => {
		console.log(err);
		res.json(err);
	});
});

router.get("/transfers/update/:id", mustHaveSession, function (req, res) {
	let driverPromise = db.query("SELECT ID, name, activeVehicle FROM appuser");
	let vehiclePromise = db.query("SELECT ID, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as name FROM vehicle");
	let operatorPromise = db.query("SELECT ID, name FROM serviceoperator");

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
		});
	}).catch(err => {
		console.log(err);
		res.redirect("/admin/transfers");
	});


});

router.post("/transfers/update/:id", mustHaveSession, function (req, res) {
	db.query(`UPDATE transfer SET person_name = ?, origin = ?, destination = ?, num_of_people = ?, 
					transfer_time = STR_TO_DATE(?, '%Y-%m-%dT%T.000Z'), status = ?, flight = ?, price = ?, paid = ?, driver = ?, vehicle = ?, 
					service_operator = ?, observations = ?
					WHERE ID = ?`,
		[req.body.person_name, req.body.origin, req.body.destination, req.body.num_of_people,
			req.body.datetime, req.body.status, req.body.flight, req.body.price, req.body.isPaid === "on",
			req.body.driver, req.body.vehicle, req.body.operator, req.body.observations, req.params.id]).then(() => {
		res.redirect("/admin/transfers");
	});
});

router.get("/transfers/details/:id", mustHaveSession, function (req, res) {
	db.query(`SELECT 
					transfer.ID, transfer.person_name, transfer.num_of_people, transfer.origin, transfer.destination,
				 	transfer.transfer_time, transfer.status, transfer.flight, transfer.price, transfer.paid,
				 	transfer.observations, CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') as vehicle,
				 	appuser.name as driver, serviceoperator.name as service_operator
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

	db.query("INSERT INTO VEHICLE(brand, license_plate, name, seat_number, status) VALUES (?, ?, ?, ?, ?)",
		[req.body.brand, req.body.license_plate, req.body.name, req.body.seat_number, req.body.status]).then(() => {
		res.redirect("/admin/vehicles");
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
	});
});

router.post("/vehicles/update/:id", mustHaveSession, function (req, res) {
	db.query("UPDATE vehicle SET brand = ?, license_plate = ?, name = ?, seat_number = ?, status = ? WHERE ID = ?", [req.body.brand, req.body.license_plate, req.body.name, req.body.seat_number, req.body.status, req.params.id]).then(({result}) => {
		res.redirect("/admin/vehicles")
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
					appuser.ID, appuser.name, appuser.email, appuser.birthday, 
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
	if (!req.body.email || !req.body.name || !req.body.birthday || !req.body.userType || !req.body.password || !req.body.confirmPassword) {
		res.redirect("/admin");
		return;
	}

	if (req.body.password !== req.body.confirmPassword) {
		res.redirect("/admin");
		return;
	}

	bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hash) {
		db.query(`INSERT INTO appuser(email, password, name, birthday, userType) 
					VALUES (?, ?, ?, ?, ?)`, [req.body.email, hash, req.body.name, req.body.birthday, req.body.userType]).then(() => {
			res.redirect("/admin/appusers");
		}).catch(err => {
			console.log(err);
			res.redirect("/admin/appusers");
		});
	});
});

router.get("/appusers/update/:id", mustHaveSession, function (req, res) {
	db.query("SELECT email, name, birthday, userType FROM appuser WHERE ID = ?", [req.params.id]).then(({result}) => {
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
	db.query("UPDATE appuser SET email = ?, name = ?, birthday = ?, userType = ? WHERE ID = ?", [req.body.email, req.body.name, req.body.birthday, req.body.userType, req.params.id]).then(() => {
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
	db.query(`SELECT ID, name FROM serviceoperator`).then(({result}) => {
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
	if (!req.body.name) {
		res.redirect("/admin/operators");
		return;
	}

	db.query("INSERT INTO serviceoperator(name) VALUES (?)", [req.body.name]).then(() => {
		res.redirect("/admin/operators");
	});
});

router.get("/operators/update/:id", mustHaveSession, function (req, res) {
	db.query("SELECT name FROM serviceoperator WHERE ID = ?", [req.params.id]).then(({result}) => {
		res.render("operator/operator_update", {
			ID: req.params.id,
			userID: req.session.userID,
			username: req.session.username,
			operator: result[0]
		});
	});
});

router.post("/operators/update/:id", mustHaveSession, function (req, res) {
	db.query("UPDATE serviceoperator SET name = ? WHERE ID = ?", [req.body.name, req.params.id]).then(() => {
		res.redirect("/admin/operators");
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

router.post("/genCSV", mustHaveSession, function (req, res, next) {
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
				transfer.ID 'Transfer Number', 
				transfer.person_name 'Person Name',
				transfer.num_of_people 'Number of People',
				transfer.flight 'Flight',
				transfer.origin 'Origin',
				transfer.destination 'Destination',
				DATE_FORMAT(transfer.transfer_time, '%d/%m/%Y %T') 'Transfer Time',
				transfer.status 'Status',
				appuser.name 'Driver',
				CONCAT(vehicle.brand, ' ', vehicle.name, ' (', vehicle.license_plate, ')') 'Vehicle',
				serviceoperator.name 'Operator',
				transfer.price 'Price',
				transfer.paid 'Is Paid',
				transfer.observations 'Observations'
				FROM transfer
				LEFT JOIN appuser ON transfer.driver = appuser.ID
				LEFT JOIN vehicle ON transfer.vehicle = vehicle.ID
				LEFT JOIN serviceoperator ON transfer.service_operator = serviceoperator.ID 
				${queryConditions.length > 0 ? " WHERE " + queryConditions.join(" AND ") : ""}`).then(({result, fields}) => {
		res.set('Content-Disposition', 'attachment; filename=export.csv').send(generateCSV(result, fields));
	});
});

module.exports = router;