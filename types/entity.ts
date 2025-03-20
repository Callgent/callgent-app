import type { BasicStatus, PermissionType } from "./enum";


export interface UserInfo {
	id: string;
	name: string;
	email: string;
	avatar: string;
	permissions?: Permission[];
}

export interface PageInfo {
	total?: number;
	query?: string;
	adaptor?: string;
	page?: number;
	perPage?: number;
	orderBy?: string;
}

export interface Adaptor {
	[key: string]: string;
};

export type TreeAction = 'add' | 'edit' | 'import' | 'lock' | 'select' | 'virtualApi';

export interface CallgentInfo {
	id?: string;
	name?: string;
	avatar?: string;
	whatFor?: string;
	how2Use?: string;

	liked?: number;
	viewed?: number;
	forked?: number;
	favorite?: number;

	official?: boolean;
	featured?: boolean;

	forkedPk?: number;
	mainTagId?: number;

	createdBy?: string;
	createdAt?: string;
	updatedAt?: string;
	hint?: string;
	title?: string;
	type?: string;
	host?: HostType;
	adaptorKey?: string;
	icon_url?: string;
	children?: CallgentInfo[];
	realms?: Array<Realm>;
	securities?: any;
	level?: number;
	modelTitle?: string;
	path?: string;
	data?: CallgentInfo;

	add?: boolean;
	edit?: boolean;
	delete?: boolean;
	import?: boolean;
	lock?: boolean;
	virtualApi?: boolean;
}

export interface HostType {
	email?: string;
}

export interface Scheme {
	type: string;
	in: string;
	name: string;
	provider: string;
	secret: string;
}

export interface Realm {
	id?: string;
	realmKey: string;
	authType: string;
	realm: string;
	callgentId?: string;
	scheme?: Scheme;
	perUser: boolean;
	enabled: boolean;
	type?: string;
	pricingEnabled?: boolean;
	pricing?: {
		perRequest?: number;
		perResponse?: string;
	}
}

export interface Realms {
	realms: Realm[];
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

export type AuthType = 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';

export interface FormValues {
	callgentId: string;
	authType: AuthType;
	realm: string;
	scheme: {
		type: AuthType;
		in?: 'header' | 'query' | 'cookie';
		name?: string;
		provider?: string;
		secret?: string;
	};
}

export interface NewAuthProps {
	initialData?: Realm | false;
	callgentId?: string;
	realmKey?: string;
	selectId?: string;
}