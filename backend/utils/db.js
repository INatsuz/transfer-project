const mysql = require("mysql");

// const connectionConfig = {
// 	host: 'localhost',
// 	user: 'inatsuz',
// 	password: 'VRaminhos2509',
// 	database: 'transfer_app',
// 	timezone: 'Z'
// };

const pool = mysql.createPool({
	connectionLimit : 10,
	host            : 'vraminhos.com',
	user            : 'inatsuz',
	password        : 'VRaminhos2509',
	database        : 'transfer_app',
	timezone		: 'Z'
});

// function connect() {
// 	let conn = mysql.createConnection(connectionConfig);
// 	conn.connect(function (err) {
// 		if (err) {
// 			console.log(err);
// 			setTimeout(function () {
// 				return connect();
// 			}, 5000);
// 		} else {
// 			console.log("Connected to database successfully");
// 			return conn;
// 		}
// 	});
//
// 	return conn;
// }
//
// function getConnection() {
// 	return connect();
// }

function query(query, params, callback) {
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, conn) {
			if (err) {
				console.log("Could not get pool connection")
				return;
			}

			conn.query(query, params, function (err, result, fields) {
				if (callback) {
					callback(err, result, fields);
				}

				if (err) {
					conn.release();
					reject(err);
					return;
				}

				conn.release();

				resolve({result: result, fields: fields});
			});
		});



	});
}

module.exports.query = query;