import { lazy, Suspense } from "react";
import { SvgIcon } from "@/components/icon";
import type { AppRouteObject } from "#/router";
import { CircleLoading } from "@/components/loading";
import { Outlet } from "react-router";

const HomePage = lazy(() => import("@/pages/dashboard/workbench"));

const publicRouter: AppRouteObject = {
  path: "/",
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: "/workbench",
      element: <HomePage />,
      meta: {
        label: "sys.menu.billing.billing",
        icon: <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />,
        key: "/workbench",
        hideMenu: true
      },
    }
  ]
};

export default publicRouter;
