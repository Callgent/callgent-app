import apiClient from "../utils/apiClient";

// Transaction details
export const transactions = () =>
	apiClient.get({
		url: "/api/transactions"
	});
