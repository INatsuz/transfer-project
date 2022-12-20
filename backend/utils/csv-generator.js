const DELIMITER = ','

function generateCSV(data, fields) {
	let csvString = "\uFEFF";

	//Adding the field names
	for (let i = 0; i < fields.length; i++) {
		csvString += '"' + fields[i].name + '"' + DELIMITER;
	}
	csvString = csvString.slice(0, -1);
	csvString += "\n";

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < fields.length; j++) {
			csvString += '"' + data[i][fields[j].name] + '"' + DELIMITER;
		}
		csvString = csvString.slice(0, -1);
		csvString += "\n";
	}

	return csvString;
}

module.exports.generateCSV = generateCSV;