import type { BasicStatus, PermissionType } from "./enum";


export interface UserInfo {
	id: string;
	name: string;
	email: string;
	avatar: string;
	permissions?: Permission[];
}

export interface CallgentInfo {
	id: string;
	name: string;
	avatar?: string;
	summary?: string;
	instruction?: string;

	liked: number;
	viewed: number;
	forked: number;
	favorite: number;

	official: boolean;
	featured: boolean;

	forkedPk?: number;
	mainTagId?: number;

	createdBy?: string;
	createdAt?: string;
	updatedAt?: string;
}


export interface Organization {
	id: string;
	name: string;
	status: "enable" | "disable";
	desc?: string;
	order?: number;
	children?: Organization[];
}

export interface Permission {
	id: string;
	parentId: string;
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order?: number;
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission[];
}

export interface Role {
	id: string;
	name: string;
	label: string;
	status: BasicStatus;
	order?: number;
	desc?: string;
	permission?: Permission[];
}
