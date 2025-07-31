import { Divider, type MenuProps } from "antd";
import Dropdown, { type DropdownProps } from "antd/es/dropdown/dropdown";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

import { IconButton } from "@/components/icon";
import { useLoginStateContext } from "@/pages/sys/login/providers/LoginStateProvider";
import { useRouter } from "@/router/hooks";
import { useFetchUserInfo, useUserActions, useUserInfo } from "@/models/userStore";
import { useTheme } from "@/theme/hooks";

/**
 * Account Dropdown
 */

export default function AccountDropdown() {
	const { push } = useRouter();
	const { name, email, avatar } = useUserInfo();
	const userInfo = useFetchUserInfo();
	const init = async () => {
		await userInfo()
	}

	useEffect(() => {
		init()
	}, [])
	const { clearUserInfoAndToken } = useUserActions();
	const { backToLogin } = useLoginStateContext();
	const { t } = useTranslation();
	const logout = () => {
		try {
			clearUserInfoAndToken();
			backToLogin();
		} finally {
			push("/login", { replace: false });
		}
	};
	const {
		themeVars: { colors, borderRadius, shadows },
	} = useTheme();

	const contentStyle: React.CSSProperties = {
		backgroundColor: colors.background.default,
		borderRadius: borderRadius.lg,
		boxShadow: shadows.dropdown,
	};

	const menuStyle: React.CSSProperties = {
		boxShadow: "none",
	};

	const dropdownRender: DropdownProps["dropdownRender"] = (menu) => (
		<div style={contentStyle}>
			<div className="flex flex-col items-start p-4">
				<div>{name}</div>
				<div className="text-gray">{email}</div>
			</div>
			<Divider style={{ margin: 0 }} />
			{React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
		</div>
	);

	const items: MenuProps["items"] = [
		{
			label: <NavLink to="/management/user/profile">{t("sys.menu.user.profile")}</NavLink>,
			key: "0",
		},
		{
			label: <NavLink to="/management/system/organization">{t("sys.menu.system.organization")}</NavLink>,
			key: "1",
		},
		{ type: "divider" },
		{
			label: (
				<button className="font-bold text-warning" type="button">
					{t("sys.login.logout")}
				</button>
			),
			key: "2",
			onClick: logout,
		},
	];

	return (
		<Dropdown menu={{ items }} trigger={["click"]} dropdownRender={dropdownRender}>
			<IconButton className="h-10 w-10 transform-none px-0 hover:scale-105">
				<img className="h-8 w-8 rounded-full" src={avatar} alt="" />
			</IconButton>
		</Dropdown>
	);
}
