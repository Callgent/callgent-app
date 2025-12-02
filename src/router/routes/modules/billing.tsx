import { lazy, Suspense } from "react";
import { SvgIcon } from "@/components/icon";
import type { AppRouteObject } from "@/types/router";
import { CircleLoading } from "@/components/layouts/loading";

const Billing = lazy(() => import("@/pages/billing"));

const billing: AppRouteObject = {
  order: 4,
  path: "billing",
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Billing />
    </Suspense>
  ),
  meta: {
    label: "sys.menu.billing.billing",
    icon: (
      <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />
    ),
    key: "/billing",
  },
};

export default billing;
