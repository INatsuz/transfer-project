const mysql = require("mysql");

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'inatsuz',
	password: 'VRaminhos2509',
	database: 'transfer_app',
	timezone: 'Z'
});
connection.connect();

function getConnection() {
	return connection;
}

module.exports = getConnection;