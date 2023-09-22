export default function getStatusColor(status) {
	switch (status) {
		case "PENDING":
			return "#FFC107";
		case "IN PROGRESS":
			return "#28a745";
		case "FINISHED":
			return "#6C757D";
		case "CONFIRMED":
			return "#0D6EFD";
		case "CANCELLED":
			return "#DC3545";
		case "REVIEW":
			return "#6610F2";
	}
}