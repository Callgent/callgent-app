import type { Result } from "#/api";
import type { CallgentInfo } from "#/entity";
import apiClient from "../apiClient";

export interface CallgentParams {
	query?: string;
}

export enum CallgentApi {
	GetAllCallgent = "/api/callgents",
	Create = "/api/callgents",
	Update = "/api/callgents/",
	Delete = "/api/callgents/",
	GetAllServer = "/api/entries/server"
}

/** GET /api/callgents */
const getCallgents = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({ url: CallgentApi.GetAllCallgent, params });

/** GET /api/server */
const getServer = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({ url: CallgentApi.GetAllServer, params });

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
	getServer,
};
