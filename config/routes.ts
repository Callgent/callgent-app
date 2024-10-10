/**
 * @doc https://umijs.org/docs/guides/routes
 */

export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
        icon: 'user',
      },
    ],
  },
  {
    path: '/execution',
    name: 'execution',
    icon: 'crown',
    routes: [
      {
        path: '/execution',
        redirect: '/execution/tasks',
      },
      {
        path: '/execution/tasks',
        name: 'tasks',
        component: './execution/tasks',
        icon: 'file',
      },
      {
        path: '/execution/workflows',
        name: 'workflows',
        component: './execution/workflows',
        icon: 'dashboard',
      },
    ],
  },
  {
    path: '/services',
    name: 'services',
    icon: 'api',
    routes: [
      {
        path: '/services/my-callgents',
        name: 'my-callgents',
        component: './services/my-callgents',
        icon: 'team',
      },
      {
        path: '/services/callgent-hub',
        name: 'callgent-hub',
        component: './services/callgent-hub',
        icon: 'setting',
      },
    ],
  },
  {
    path: '/integration',
    name: 'integration',
    icon: 'api',
    routes: [
      {
        path: '/integration/entries',
        name: 'entries',
        component: './integration/entries',
        icon: 'api',
      },
      {
        path: '/integration/ai-models',
        name: 'AImodels',
        component: './integration/ai-models',
        icon: 'smile',
      },
    ],
  },
  {
    path: '/account',
    name: 'account',
    icon: 'user',
    routes: [
      {
        path: '/account/profile',
        name: 'profile',
        component: './account/profile',
        icon: 'user',
      },
      {
        path: '/account/preferences',
        name: 'preferences',
        component: './account/preferences',
        icon: 'setting',
      },
      {
        path: '/account/team-members',
        name: 'team-members',
        component: './account/team-members',
        icon: 'team',
      },
    ],
  },
  {
    path: '/showcase',
    name: 'showcase',
    icon: 'user',
    component: './showcase',
  },
  {
    path: '/',
    redirect: '/execution',
    icon: 'home',
  },
  {
    path: '*',
    layout: false,
    component: './404',
    icon: 'file',
  },
];
