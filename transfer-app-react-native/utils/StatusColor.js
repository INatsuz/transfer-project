export default function getStatusColor(status) {
	switch (status) {
		case "PENDING":
			return "#FFC107";
		case "IN PROGRESS":
			return "#0D6EFD";
		case "FINISHED":
			return "#6C757D";
		case "CONFIRMED":
			return "#28A745";
		case "OUTSOURCE":
			return "#DC3545";
		case "BUS":
			return "#E0636F";
	}
}
