import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { deleteCookie } from "@/router/utils";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import { StorageEnum } from "#/enum";
import { findUserInfo, signin, SignInReq } from "@/api/services/userService";
import { useRouter } from "@/router/hooks";

const { VITE_APP_HOMEPAGE: HOMEPAGE, VITE_COOKIE_NAME } = import.meta.env;

type UserStore = {
	userInfo: Partial<UserInfo>;
	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		clearUserInfoAndToken: () => void;
	};
};

const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			userInfo: {},
			userToken: {},
			actions: {
				setUserInfo: (userInfo) => {
					set({ userInfo });
				},
				clearUserInfoAndToken() {
					deleteCookie(VITE_COOKIE_NAME || "x-callgent-jwt")
					set({ userInfo: {} });
				},
			},
		}),
		{
			name: "userStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.userInfo,
			}),
		},
	),
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserPermission = () => useUserStore((state) => state.userInfo.permissions);
export const useUserActions = () => useUserStore((state) => state.actions);

export const useSignIn = () => {
	const { push } = useRouter()
	const signIn = async (loginData: SignInReq) => {
		try {
			await signin(loginData);
			push(HOMEPAGE, { replace: false });
			toast.success("Sign in success!");
		} catch (err) {
			toast.error(err.message, {
				position: "top-center",
			});
		}
	};

	return signIn;
};

// getUserInfo API 
export const useFetchUserInfo = () => {
	const { setUserInfo } = useUserActions();
	const fetchUserInfo = async () => {
		try {
			const { data } = await findUserInfo();
			setUserInfo({
				...data,
				avatar: data.avatar || '/images/avatar.svg'
			});
		} catch (err) {
			toast.error(err.message, {
				position: "top-center",
			});
		}
	};

	return fetchUserInfo;
};


export default useUserStore;
