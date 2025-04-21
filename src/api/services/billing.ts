import apiClient from "../apiClient";

// Transaction details
export const transactions = () =>
	apiClient.get({
		url: "/api/transactions"
	});
