const mysql = require("mysql");

const connectionConfig = {
	host: 'localhost',
	user: 'inatsuz',
	password: 'VRaminhos2509',
	database: 'transfer_app',
	timezone: 'Z'
};

let connection = null;

function connect() {
	connection = mysql.createConnection(connectionConfig);
	connection.connect(function (err) {
		if (err) {
			console.log(err);
			setTimeout(function () {
				connect();
			}, 5000);
		}

		console.log("Connected to database successfully");
	});
}

connect();

function getConnection() {
	return connection;
}

module.exports = getConnection;