export interface Result<T = any> {
	statusCode?: number;
	message?: string | Array<string>;
	data: T;
	meta?: any;
}
