import {useEffect, useState} from "react";
import {getWithAuth} from "../utils/Requester";


export default function useDrivers(driver, driverName) {
	const [drivers, setDrivers] = useState(driver && driverName ? [{ID: driver, name: driverName}] : []);

	useEffect(() => {
		fetchDrivers();
	}, []);

	async function fetchDrivers() {
		getWithAuth("api/getDrivers").then(res => {
			setDrivers(res.data.drivers);
		}).catch(err => {
			console.log(err);
		});
	}

	return [drivers, setDrivers];
}