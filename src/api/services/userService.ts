import apiClient from "../apiClient";

import type { Result } from "#/api";
import type { UserInfo } from "#/entity";

export interface SignInReq {
	username: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}

export type SignInRes = { data: string };

/** POST /api/auth/login */
export const signin = (data: SignInReq) =>
	apiClient.post<SignInRes>({
		url: "/api/auth/login",
		data
	});

/** POST /auth/signup */
export const signup = (data: SignUpReq) =>
	apiClient.post<SignInRes>({
		url: "/auth/signup",
		data
	});

/** GET /auth/logout */
export const logout = () =>
	apiClient.get({
		url: "/auth/logout"
	});

/** GET /api/users/info */
export const findUserInfo = () =>
	apiClient.get<Result<UserInfo>>({
		url: "/api/users/info"
	});