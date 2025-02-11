import useUserStore from "@/store/userStore";
import { faker } from "@faker-js/faker";

import { BasicStatus, PermissionType } from "#/enum";
/**
 * Organization data mock
 */
export const ORG_LIST = [
	{
		id: "1",
		name: "East China Branch",
		status: "enable",
		desc: faker.lorem.words(),
		order: 1,
		children: [
			{
				id: "1-1",
				name: "R&D Department",
				status: "disable",
				desc: "",
				order: 1,
			},
			{
				id: "1-2",
				name: "Marketing Department",
				status: "enable",
				desc: "",
				order: 2,
			},
			{
				id: "1-3",
				name: "Finance Department",
				status: "enable",
				desc: "",
				order: 3,
			},
		],
	},
	{
		id: "2",
		name: "South China Branch",
		status: "enable",
		desc: faker.lorem.words(),
		order: 2,
		children: [
			{
				id: "2-1",
				name: "R&D Department",
				status: "disable",
				desc: "",
				order: 1,
			},
			{
				id: "2-2",
				name: "Marketing Department",
				status: "enable",
				desc: "",
				order: 2,
			},
			{
				id: "2-3",
				name: "Finance Department",
				status: "enable",
				desc: "",
				order: 3,
			},
		],
	},
];

/**
 * User permission mock
 */
const DASHBOARD_PERMISSION = {
	id: "9100714781927703",
	parentId: "",
	label: "sys.menu.dashboard",
	name: "Dashboard",
	icon: "ic-analysis",
	type: PermissionType.CATALOGUE,
	route: "dashboard",
	order: 1,
	children: [
		{
			id: "8426999229400979",
			parentId: "9100714781927703",
			label: "sys.menu.workbench",
			name: "Workbench",
			type: PermissionType.MENU,
			route: "workbench",
			component: "/dashboard/workbench/index.tsx",
		},
		{
			id: "9710971640510357",
			parentId: "9100714781927703",
			label: "sys.menu.analysis",
			name: "Analysis",
			type: PermissionType.MENU,
			route: "analysis",
			component: "/dashboard/analysis/index.tsx",
		},
	],
};

const MANAGEMENT_PERMISSION = {
	id: "0901673425580518",
	parentId: "",
	label: "sys.menu.management",
	name: "Management",
	icon: "ic-management",
	type: PermissionType.CATALOGUE,
	route: "management",
	order: 2,
	children: [
		{
			id: "2781684678535711",
			parentId: "0901673425580518",
			label: "sys.menu.user.index",
			name: "User",
			type: PermissionType.CATALOGUE,
			route: "user",
			children: [
				{
					id: "4754063958766648",
					parentId: "2781684678535711",
					label: "sys.menu.user.profile",
					name: "Profile",
					type: PermissionType.MENU,
					route: "profile",
					component: "/management/user/profile/index.tsx",
				},
				{
					id: "2516598794787938",
					parentId: "2781684678535711",
					label: "sys.menu.user.account",
					name: "Account",
					type: PermissionType.MENU,
					route: "account",
					component: "/management/user/account/index.tsx",
				},
			],
		},
		{
			id: "0249937641030250",
			parentId: "0901673425580518",
			label: "sys.menu.system.index",
			name: "System",
			type: PermissionType.CATALOGUE,
			route: "system",
			children: [
				{
					id: "1985890042972842",
					parentId: "0249937641030250",
					label: "sys.menu.system.organization",
					name: "Organization",
					type: PermissionType.MENU,
					route: "organization",
					component: "/management/system/organization/index.tsx",
				},
				{
					id: "4359580910369984",
					parentId: "0249937641030250",
					label: "sys.menu.system.permission",
					name: "Permission",
					type: PermissionType.MENU,
					route: "permission",
					component: "/management/system/permission/index.tsx",
				},
				{
					id: "1689241785490759",
					parentId: "0249937641030250",
					label: "sys.menu.system.role",
					name: "Role",
					type: PermissionType.MENU,
					route: "role",
					component: "/management/system/role/index.tsx",
				},
				{
					id: "0157880245365433",
					parentId: "0249937641030250",
					label: "sys.menu.system.user",
					name: "User",
					type: PermissionType.MENU,
					route: "user",
					component: "/management/system/user/index.tsx",
				},
				{
					id: "0157880245365434",
					parentId: "0249937641030250",
					label: "sys.menu.system.user_detail",
					name: "User Detail",
					type: PermissionType.MENU,
					route: "user/:id",
					component: "/management/system/user/detail.tsx",
					hide: true,
				},
			],
		},
	],
};

const CALLGENT_PERMISSION = {
	id: "9100715781980703",
	parentId: "",
	label: "sys.menu.dashboard",
	name: "Callgent",
	icon: "ic-analysis",
	type: PermissionType.CATALOGUE,
	route: "callgent",
	order: 3,
	children: [
		{
			id: "8426999229400979",
			parentId: "9100714781927703",
			label: "sys.menu.workbench",
			name: "Workbench",
			type: PermissionType.MENU,
			route: "workbench",
			component: "/dashboard/workbench/index.tsx",
		},
		{
			id: "9710971640510357",
			parentId: "9100714781927703",
			label: "sys.menu.analysis",
			name: "Analysis",
			type: PermissionType.MENU,
			route: "analysis",
			component: "/dashboard/analysis/index.tsx",
		},
	],
};

const OTHERS_PERMISSION = [
	{
		id: "0941594969900756",
		parentId: "",
		label: "sys.menu.blank",
		name: "Disabled",
		icon: "ic_blank",
		type: PermissionType.MENU,
		route: "blank",
		component: "/sys/others/blank.tsx",
	},
];

export const PERMISSION_LIST = [
	DASHBOARD_PERMISSION,
	MANAGEMENT_PERMISSION,
	CALLGENT_PERMISSION,
	...OTHERS_PERMISSION,
];

/**
 * User role mock
 */
const ADMIN_ROLE = {
	id: "4281707933534332",
	name: "Admin",
	label: "admin",
	status: BasicStatus.ENABLE,
	order: 1,
	desc: "Super Admin",
	permission: PERMISSION_LIST,
};
const TEST_ROLE = {
	id: "9931665660771476",
	name: "Test",
	label: "test",
	status: BasicStatus.ENABLE,
	order: 2,
	desc: "test",
	permission: [DASHBOARD_PERMISSION],
};
export const ROLE_LIST = [ADMIN_ROLE, TEST_ROLE];

/**
 * User data mock
 */
export const DEFAULT_USER = {
	id: "b34719e1-ce46-457e-9575-99505ecee828",
	username: "admin",
	email: faker.internet.email(),
	avatar: faker.image.avatarGitHub(),
	createdAt: faker.date.anytime(),
	updatedAt: faker.date.recent(),
	password: "demo1234",
	role: ADMIN_ROLE,
	permissions: ADMIN_ROLE.permission,
};
export const TEST_USER = {
	id: "efaa20ea-4dc5-47ee-a200-8a899be29494",
	username: "test",
	password: "demo1234",
	email: faker.internet.email(),
	avatar: faker.image.avatarGitHub(),
	createdAt: faker.date.anytime(),
	updatedAt: faker.date.recent(),
	role: TEST_ROLE,
	permissions: TEST_ROLE.permission,
};
export const USER_LIST = [DEFAULT_USER, TEST_USER];

// * Hot update, updating user permissions, only effective in the development environment
if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		if (!newModule) return;

		const { DEFAULT_USER, TEST_USER, PERMISSION_LIST } = newModule;

		const {
			userInfo,
			actions: { setUserInfo },
		} = useUserStore.getState();

		if (!userInfo?.username) return;

		const newUserInfo = userInfo.username === DEFAULT_USER.username ? DEFAULT_USER : TEST_USER;

		setUserInfo(newUserInfo);

	});
}
