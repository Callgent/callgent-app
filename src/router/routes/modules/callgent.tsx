import { Suspense, lazy } from "react";
import { Navigate, Outlet } from "react-router";

import { SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/layouts/loading";

import type { AppRouteObject } from "@/types/router";
import CallgentInfo from "@/pages/callgent/callgent-tree";
import CallgentAuth from "@/pages/callgent/callgent-auth";
import CallgentRrealms from "@/pages/callgent/realm";
import RealmEditPage from "@/pages/callgent/realm/edit";
import RealmNewPage from "@/pages/callgent/realm/new";

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
    icon: (
      <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />
    ),
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
      meta: {
        label: "sys.menu.callgent.callgents",
        key: "/callgent/callgents",
      },
    },
    {
      path: "services",
      element: <Services />,
      meta: { label: "sys.menu.callgent.services", key: "/callgent/services" },
    },
    {
      path: "histtasks",
      element: <HistTasks />,
      meta: {
        label: "sys.menu.callgent.histtasks",
        key: "/callgent/histtasks",
      },
    },
    {
      path: "realms",
      element: <CallgentRrealms />,
      meta: {
        label: "sys.menu.callgent.realm",
        key: "/callgent/realms",
      },
    },
    {
      path: "realms/:id/edit",
      element: <RealmEditPage />,
      meta: {
        label: "sys.menu.callgent.realms",
        key: "/callgent/realms/edit",
        hideMenu: true,
      },
    },
    {
      path: "realms-new",
      element: <RealmNewPage />,
      meta: {
        label: "sys.menu.callgent.realms-new",
        key: "/callgent/realms-new",
        hideMenu: true,
      },
    },
    {
      path: "tree",
      element: <CallgentInfo />,
      meta: {
        label: "sys.menu.callgent.callgentinfo",
        key: "/callgent/info",
        hideMenu: true,
      },
    },
    {
      path: "auth",
      element: <CallgentAuth />,
      meta: {
        label: "sys.menu.callgent.callgentauth",
        key: "/callgent/auth",
        hideMenu: true,
      },
    },
  ],
};

export default callgent;
