export default function getStatusColor(status) {
	switch (status) {
		case "PENDING":
			return "#FFC107";
		case "IN PROGRESS":
			return "#28a745";
		case "FINISHED":
			return "#6C757D";
		case "REVIEW":
			return "#DC3545";
	}
}