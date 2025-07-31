import { useCallback, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import PageError from "@/pages/sys/error/PageError";
import { useRouter } from "../hooks";
import { getCookie } from "../utils";

type Props = {
	children: React.ReactNode;
};
const { VITE_COOKIE_NAME } = import.meta.env;
export default function ProtectedRoute({ children }: Props) {
	const { push } = useRouter();
	const token = getCookie(VITE_COOKIE_NAME || 'x-callgent-jwt');

	const check = useCallback(() => {
		if (!token) {
			push("/login", { replace: false });
		}
	}, [push, name]);

	useEffect(() => {
		check();
	}, [check]);

	return <ErrorBoundary FallbackComponent={PageError}>{children}</ErrorBoundary>;
}
