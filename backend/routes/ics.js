const express = require('express');
const {query} = require("../utils/db");
const ical = require("ical-generator");
const router = express.Router();

const PASSWORD = "VNqah48oHEc1K0ghI5ew7qidcZRp1wQs";

router.get("/", function (req, res) {
	const password = req.query.s;

	if (password !== PASSWORD) {
		res.status(401).json({err: "Unauthorized"});
		return;
	}


	query("SELECT * FROM transfer WHERE DATE(transfer_time) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ", []).then(({result}) => {
		let events = [];

		for (let i in result) {
			let start = new Date(result[i].transfer_time);
			let end = new Date(start.getTime());
			end.setMinutes(end.getMinutes() + 30);
			events.push(
				{
					start,
					end,
					summary: `${result[i].person_name} : ${result[i].num_of_people} | ${result[i].origin} → ${result[i].destination}`,
					description: `Name: ${result[i].person_name}\nPax: ${result[i].num_of_people}\nOrigin: ${result[i].origin}\nDestination: ${result[i].destination}\nPrice: ${result[i].price}\nFlight: ${result[i].flight}\nObservations: ${result[i].observations}`,
					id: result[i].ID
				}
			);
		}

		let cal = new ical.ICalCalendar({
			prodId: '//transfer-app//transfer-ics//EN',
			events
		});

		cal.serve(res);
	});
});

module.exports = router;
