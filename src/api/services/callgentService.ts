import type { Result } from "#/api";
import type { CallgentInfo } from "#/entity";
import apiClient from "../apiClient";
import { useMutation } from "@tanstack/react-query";

export interface CallgentParams {
	query?: string;
}

export enum CallgentApi {
	GetAllCallgent = "/api/callgents",
	GetCallgentTree = "/api/bff/callgent-tree/",
	Create = "/api/callgents",
	Update = "/api/callgents/",
	Delete = "/api/callgents/",
	GetAllServer = "/api/entries/server",
	GetAllTasks = "/api/events/tasks",
}

/** GET /api/callgents */
const getCallgents = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({ url: CallgentApi.GetAllCallgent, params });

/** GET /api/callgentTree */
const getCallgentTree = (id: string) =>
	apiClient.get<Result<CallgentInfo>>({ url: CallgentApi.GetCallgentTree + id });

/** GET /api/server */
const getServer = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({ url: CallgentApi.GetAllServer, params });

/** GET /api/tasks */
const getTasks = (params?: CallgentParams) =>
	apiClient.get<Result<CallgentInfo[]>>({ url: CallgentApi.GetAllTasks, params });

/** POST /api/callgents */
const postCallgent = (data: CallgentInfo) =>
	apiClient.post<Result<CallgentInfo>>({ url: CallgentApi.Create, data });

/** PUT /api/callgents/:id */
const putCallgent = (id: string, data: CallgentInfo) =>
	apiClient.put<Result<CallgentInfo>>({ url: `${CallgentApi.Update}${id}`, data });

/** DELETE /api/callgents/:id */
const deleteCallgent = (id: string) =>
	apiClient.delete<Result<CallgentInfo>>({ url: `${CallgentApi.Delete}${id}` });

/** add entries **/
export const useCreateCallgentEntry = () => {
	return useMutation({
		mutationFn: (params: { adaptor: string; formValues: any }) =>
			apiClient.post<any>({
				url: `/api/entries/${params.adaptor}/create`,
				data: params.formValues
			})
	});
};

/** add entries **/
export const useEditCallgentEntry = () => {
	return useMutation({
		mutationFn: (params: { id: string; formValues: any }) =>
			apiClient.put<any>({
				url: `/api/entries/${params.id}`,
				data: params.formValues
			})
	});
};

/** add entries **/
export const useImportEntry = () => {
	return useMutation({
		mutationFn: (params: { formValues: any }) =>
			apiClient.post<any>({
				url: "/api/bff/endpoints/import",
				data: params.formValues
			})
	});
};

/** fetch adaptors **/
export const useFetchAdaptors = () => {
	return useMutation({
		mutationFn: () => apiClient.get<any>({
			url: '/api/entries/adaptors?client=true'
		})
	});
};

/** del entry **/
export const useDeleteEntry = () => {
	return useMutation({
		mutationFn: (id: string) => apiClient.delete<any>({
			url: '/api/entries/' + id
		})
	});
};

export default {
	getCallgents,
	getCallgentTree,
	postCallgent,
	putCallgent,
	deleteCallgent,
	getServer,
	getTasks
};
