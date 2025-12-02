import apiClient from "../utils/apiClient";

/** get /api/realm */
export const getRealmApi = async () =>
	apiClient.get<any>({
		url: `/api/realm`
	});

/** get /api/realm */
export const getRealmDetailApi = async () =>
	apiClient.get<any>({
		url: `/api/realm/a`
	});