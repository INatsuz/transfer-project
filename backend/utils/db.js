const mysql = require("mysql");

const pool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'transfer_app',
	timezone: 'Z',
	charset: 'utf8mb4'
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