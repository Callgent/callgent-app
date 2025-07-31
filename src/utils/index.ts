import { unsavedGuard } from "@/router/utils";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const createSearchParams = (paramsObj: Record<string, string | undefined>) => {
	const params = new URLSearchParams();
	Object.entries(paramsObj).forEach(([key, value]) => {
		if (value) {
			params.append(key, value);
		}
	});
	return params;
};

export const getSearchParamsAsJson = (): Record<string, string | undefined> => {
	const params = new URLSearchParams(window.location.search);
	const paramsObj: Record<string, string | undefined> = {};
	params.forEach((value, key) => {
		paramsObj[key] = value;
	});
	return paramsObj;
};

export const shouldPreventNavigation = (config: { confirm?: boolean } = { confirm: true }) => {
	const { confirm } = config
	if (!confirm) {
		return true
	}
	if (unsavedGuard.hasUnsavedChanges()) {
		const shouldProceed = window.confirm('确定要离开吗？未保存的更改将会丢失');
		if (shouldProceed) {
			unsavedGuard.setUnsavedChanges(false);
			return false;
		}
		return true;
	}
	return false;
}