import type { Result } from "#/api";
import type { CallgentInfo, Realm } from "#/entity";
import apiClient from "../apiClient";

export interface CallgentParams {
	query?: string;
}

/** GET /api/callgents */
export const getCallgents = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({
		url: "/api/callgents",
		params
	});

/** GET /api/bff/callgent-tree/:id */
export const getCallgentTree = (id: string) =>
	apiClient.get<Result<CallgentInfo>>({
		url: `/api/bff/callgent-tree/${id}`
	});

/** GET /api/entries/server */
export const getServer = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({
		url: "/api/entries/server",
		params
	});

/** GET /api/events/tasks */
export const getTasks = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({
		url: "/api/events/tasks",
		params
	});

/** POST /api/callgents */
export const postCallgent = (data: CallgentInfo) =>
	apiClient.post<Result<CallgentInfo>>({
		url: "/api/callgents",
		data
	});

/** PUT /api/callgents/:id */
export const putCallgent = (id: string, data: CallgentInfo) =>
	apiClient.put<Result<CallgentInfo>>({
		url: `/api/callgents/${id}`,
		data
	});

/** DELETE /api/callgents/:id */
export const deleteCallgent = (id: string) =>
	apiClient.delete<Result<CallgentInfo>>({
		url: `/api/callgents/${id}`
	});

/** Create callgent entry - POST /api/entries/:adaptor/create */
export const createCallgentEntry = async (params: { adaptor: string; formValues: any }) =>
	apiClient.post<any>({
		url: `/api/entries/${params.adaptor}/create`,
		data: params.formValues
	});

/** Edit callgent entry - PUT /api/entries/:id */
export const editCallgentEntry = async (params: { id: string; formValues: any }) =>
	apiClient.put<any>({
		url: `/api/entries/${params.id}`,
		data: params.formValues
	});

/** Import entry - POST /api/bff/endpoints/import */
export const importEntry = async (params: { formValues: any }) =>
	apiClient.post<any>({
		url: "/api/bff/endpoints/import",
		data: params.formValues
	});

/** Fetch adaptors - GET /api/entries/adaasdptors?client=true */
export const fetchAdaptors = () =>
	apiClient.get<any>({
		url: "/api/entries/adaptors?client=true"
	});

/** Delete entry - DELETE /api/entries/:id */
export const deleteEntry = async (id: string) =>
	apiClient.delete<any>({
		url: `/api/entries/${id}`
	});

/** Post /api/callgent-realms */
export const postRealms = async (data: Realm) =>
	apiClient.post<any>({
		url: `/api/callgent-realms`,
		data
	});

/** Put /api/callgent-realms */
export const putRealms = async (data: Realm) =>
	apiClient.put<any>({
		url: `/api/callgent-realms/${data.id}`,
		data: {
			realm: data?.realm,
			scheme: data?.scheme,
			pricing: data?.pricing
		},
	});

/** Delete /api/callgent-realms */
export const deleteRealms = async (data: { id?: string }) =>
	apiClient.delete<any>({
		url: `/api/callgent-realms/${data.id}`
	});

/** Select /api/callgent-realms */
export const selectRealms = async (data: CallgentInfo, realmKey: { realmKey: string }[]) =>
	apiClient.post<any>({
		url: `/api/callgent-realms/securities/${!data?.data?.path ? 'entry' : 'function'}/${data?.id}`,
		data: realmKey
	});

/** get /api/callgent-api */
export const getCallgentApi = async (id: string) =>
	apiClient.get<any>({
		url: `/api/endpoints/${id}`
	});

/** put /api/callgent-api */
export const putCallgentApi = async (id: string, data: any) =>
	apiClient.put<any>({
		url: `/api/endpoints/${id}`,
		data
	});

/** del /api/endpoints */
export const delCallgentApi = async (id: string) =>
	apiClient.delete<any>({
		url: `/api/endpoints/${id}`
	});

/** post /api/callgent-api */
export const postEndpointsApi = async (data: any) =>
	apiClient.post({ url: '/api/endpoints', data });

/** post /api/request */
export const postRequestApi = async (callgentId: string, data: any, taskId: string) =>
	apiClient.post({
		url: `/api/rest/request/${callgentId}/`, data, headers: {
			"Content-Type": "multipart/form-data",
			"x-callgent-taskId": taskId
		}
	});

