const mysql = require("mysql");

const pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'inatsuz',
	password: 'VRaminhos2509',
	database: 'transfer_app',
	timezone: 'Z'
});

function query(query, params, callback) {
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, conn) {
			if (err) {
				console.log(err);
				console.log("Could not get pool connection")
				reject(err);
				return;
			}

			conn.query(query, params, function (err, result, fields) {
				conn.release();
				if (callback) {
					callback(err, result, fields);
				}

				if (err) {
					reject(err);
					return;
				}

				resolve({result: result, fields: fields});
			});
		});
	});
}

module.exports.query = query;