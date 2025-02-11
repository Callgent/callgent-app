import apiClient from "../apiClient";

import type { UserInfo } from "#/entity";
import { Result } from "#/api";

export interface SignInReq {
	username: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}
export type SignInRes = { data: string };

export enum UserApi {
	SignIn = "/api/auth/login",
	SignUp = "/auth/signup",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh",
	User = "/user",
}

const signin = (data: SignInReq) => apiClient.post<SignInRes>({ url: UserApi.SignIn, data });
const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
const logout = () => apiClient.get({ url: UserApi.Logout });
const findUserInfo = () => apiClient.get<Result<UserInfo>>({ url: "/api/users/info" });

export default {
	signin,
	signup,
	findUserInfo,
	logout,
};
