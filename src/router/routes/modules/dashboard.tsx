import { Suspense, lazy } from "react";

import { SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/layouts/loading";

import type { AppRouteObject } from "@/types/router";

const Analysis = lazy(() => import("@/pages/dashboard/analysis"));

const dashboard: AppRouteObject = {
  order: 1,
  path: "dashboard",
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Analysis />
    </Suspense>
  ),
  meta: {
    label: "sys.menu.dashboard",
    icon: (
      <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />
    ),
    key: "/dashboard",
  },
};

export default dashboard;
