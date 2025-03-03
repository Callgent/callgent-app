import { Suspense, lazy } from "react";
import { Navigate, Outlet } from "react-router";

import { SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";
import CallgentInfo from "@/pages/callgent/callgent-tree";
import CallgentApi from "@/pages/callgent/callgent-api";

const Callgents = lazy(() => import("@/pages/callgent/callgents"));
const Services = lazy(() => import("@/pages/callgent/services"));
const HistTasks = lazy(() => import("@/pages/callgent/hist-tasks"));

const callgent: AppRouteObject = {
  order: 2,
  path: "callgent",
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: "sys.menu.callgent.callgent",
    icon: <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />,
    key: "/callgent",
  },
  children: [
    {
      index: true,
      element: <Navigate to="callgent" replace />,
    },
    {
      path: "callgents",
      element: <Callgents />,
      meta: { label: "sys.menu.callgent.callgents", key: "/callgent/callgents" },
    },
    {
      path: "services",
      element: <Services />,
      meta: { label: "sys.menu.callgent.services", key: "/callgent/services" },
    },
    {
      path: "histtasks",
      element: <HistTasks />,
      meta: { label: "sys.menu.callgent.histtasks", key: "/callgent/histtasks" },
    },
    {
      path: "callgenttree",
      element: <CallgentInfo />,
      meta: { label: "sys.menu.callgent.callgentinfo", key: "/callgent/callgentinfo", hideMenu: true },
    },
  ],
};

export default callgent;
