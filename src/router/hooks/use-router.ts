import { useMemo } from "react";
import { NavigateOptions, useNavigate } from "react-router";
import { shouldPreventNavigation } from "@/utils";

export function useRouter() {
	const navigate = useNavigate();

	const router = useMemo(
		() => ({
			back: () => navigate(-1),
			forward: () => navigate(1),
			reload: () => window.location.reload(),
			push: (href: string, options: NavigateOptions = {}) => {
				!shouldPreventNavigation() && navigate(href, options)
			},
			replace: (href: string) => navigate(href, { replace: true }),
		}),
		[navigate],
	);

	return router;
}
