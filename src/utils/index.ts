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