import apiClient from "../apiClient";
import type { CallgentInfo } from "#/entity";
import { Result } from "#/api";

export interface CallgentParams {
	query?: string;
}

export enum CallgentApi {
	GetAll = "/api/callgents",
	Create = "/api/callgents",
	Update = "/api/callgents/",
	Delete = "/api/callgents/",
}

/** GET /api/callgents */
const getCallgents = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({ url: CallgentApi.GetAll, params });

/** POST /api/callgents */
const postCallgent = (data: CallgentInfo) =>
	apiClient.post<Result<CallgentInfo>>({ url: CallgentApi.Create, data });

/** PUT /api/callgents/:id */
const putCallgent = (id: string, data: CallgentInfo) =>
	apiClient.put<Result<CallgentInfo>>({ url: `${CallgentApi.Update}${id}`, data });

/** DELETE /api/callgents/:id */
const deleteCallgent = (id: string) =>
	apiClient.delete<Result<CallgentInfo>>({ url: `${CallgentApi.Delete}${id}` });

export default {
	getCallgents,
	postCallgent,
	putCallgent,
	deleteCallgent,
};
