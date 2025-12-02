import { ascend } from "ramda";

import type { AppRouteObject, RouteMeta } from "@/types/router";

/**
 * return menu routes
 */
export const menuFilter = (items: AppRouteObject[]) => {
	return items
		.filter((item) => {
			const show = item.meta?.key;
			if (show && item.children) {
				item.children = menuFilter(item.children);
			}
			return show;
		})
		.sort(ascend((item) => item.order || Number.POSITIVE_INFINITY));
};

/**
 * 基于 src/router/routes/modules 文件结构动态生成路由
 */
export function getRoutesFromModules() {
	const menuModules: AppRouteObject[] = [];

	const modules = import.meta.glob("./routes/modules/**/*.tsx", {
		eager: true,
	});
	for (const key in modules) {
		const mod = (modules as any)[key].default || {};
		const modList = Array.isArray(mod) ? [...mod] : [mod];
		menuModules.push(...modList);
	}
	return menuModules;
}

/**
 * return the routes will be used in sidebar menu
 */
export function getMenuRoutes(appRouteObjects: AppRouteObject[]) {
	// return menuFilter(getMenuModules());
	return menuFilter(appRouteObjects);
}

/**
 * return flatten routes
 */
export function flattenMenuRoutes(routes: AppRouteObject[]) {
	return routes.reduce<RouteMeta[]>((prev, item) => {
		const { meta, children } = item;
		if (meta) prev.push(meta);
		if (children) prev.push(...flattenMenuRoutes(children));
		return prev;
	}, []);
}

// getCookie
export function getCookie(name: string) {
	let cookieArray = document.cookie.split(';');
	for (let i = 0; i < cookieArray.length; i++) {
		let cookiePair = cookieArray[i].split('=');
		if (name === cookiePair[0].trim()) {
			return decodeURIComponent(cookiePair[1]);
		}
	}
	return null;
}

// deleteCookie
export function deleteCookie(name: string) {
	const domain = window.location.hostname;
	document.cookie = name + '=; Path=/; Domain=' + domain + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// setLocalStorageItem
export function setLocalStorageItem(key: string, value: string) {
	localStorage.setItem(key, value);
	const event = new Event('localStorageChange');
	window.dispatchEvent(event);
}

// Page not saved
class UnsavedGuard {
	private unsavedChanges = false;
	setUnsavedChanges(hasUnsaved: boolean) {
		this.unsavedChanges = hasUnsaved;
	}
	hasUnsavedChanges() {
		return this.unsavedChanges;
	}
	cleanup() {
		this.unsavedChanges = false;
	}
}
export const unsavedGuard = new UnsavedGuard();