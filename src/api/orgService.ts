import apiClient from "../utils/apiClient";

import type { Organization } from "@/types/entity";

export enum OrgApi {
	Org = "/org",
}

const getOrgList = () => apiClient.get<Organization[]>({ url: OrgApi.Org });

export default {
	getOrgList,
};
