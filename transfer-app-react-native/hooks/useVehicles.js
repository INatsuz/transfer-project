import {useEffect, useState} from "react";
import {getWithAuth} from "../utils/Requester";


export default function useVehicles(vehicle, vehicleName) {
	const [vehicles, setVehicles] = useState(vehicle && vehicleName ? [{ID: vehicle, displayName: vehicleName}] : []);

	useEffect(() => {
		fetchVehicles();
	}, []);

	async function fetchVehicles() {
		getWithAuth("api/getVehicles").then(res => {
			setVehicles(res.data.vehicles);
		}).catch(err => {
			console.log(err);
		});
	}

	return [vehicles, setVehicles];
}