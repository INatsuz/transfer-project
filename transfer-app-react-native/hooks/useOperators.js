import {useEffect, useState} from "react";
import {getWithAuth} from "../utils/Requester";


export default function useOperators(operator, operatorName) {
	const [operators, setOperators] = useState(operator && operatorName ? [{ID: operator, name: operatorName}] : []);

	useEffect(() => {
		fetchOperators();
	}, []);

	async function fetchOperators() {
		getWithAuth("api/getOperators").then(res => {
			setOperators(res.data.operators);
		}).catch(err => {
			console.log(err);
		});
	}

	return [operators, setOperators];
}