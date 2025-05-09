import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";

import { t } from "@/locales/i18n";
import userStore from "@/models/userStore";

import { toast } from "sonner";
import type { Result } from "#/api";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: { "Content-Type": "application/json;charset=utf-8" },
	withCredentials: true
});

axiosInstance.interceptors.request.use(
	(config) => {
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

axiosInstance.interceptors.response.use(
	(res: Result) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
		const { message, data } = res.data;
		if (data) {
			return res.data;
		}
		// error
		const errorMessage = Array.isArray(message) ? message[0] : message;
		throw new Error(errorMessage || t("sys.api.apiRequestFailed"));
	},
	(error: AxiosError<Result>) => {
		const { response, message } = error || {};

		const errMsg = response?.data?.message || message || t("sys.api.errorMessage");
		toast.error(errMsg, {
			position: "top-center",
			closeButton: true
		});

		const status = response?.status;
		if (status === 401) {
			userStore.getState().actions.clearUserInfoAndToken();
		}
		return Promise.reject(response);
	},
);

class APIClient {
	get<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "GET" });
	}

	post<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "POST" });
	}

	put<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "PUT" });
	}

	delete<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "DELETE" });
	}

	request<T = any>(config: AxiosRequestConfig): Promise<T> {
		return new Promise((resolve, reject) => {
			axiosInstance
				.request<any, AxiosResponse<Result>>(config)
				.then((res: AxiosResponse<Result>) => {
					resolve(res as unknown as Promise<T>);
				})
				.catch((e: Error | AxiosError) => {
					reject(e);
				});
		});
	}
}
export default new APIClient();
