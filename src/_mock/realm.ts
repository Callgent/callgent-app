import { defineFakeRoute } from 'vite-plugin-fake-server/client';
import { providers, realms } from './response';

export default defineFakeRoute([
  // 获取所有 realms
  {
    url: '/api/realms',
    method: 'GET',
    response: () => {
      const data = realms.map(realm => ({
        ...realm,
        provider: providers.find(p => p.id === realm.providerId) || null,
      }));
      return {
        code: 0,
        message: 'OK',
        data,
      };
    },
  },

  // 获取单个 realm
  {
    url: '/api/realms/:id',
    method: 'GET',
    response: ({ params }) => {
      const realm = realms.find(r => r.id === params.id);
      if (!realm) {
        return { code: 404, message: 'Not found', data: null };
      }
      return {
        code: 0,
        message: 'OK',
        data: {
          ...realm,
          provider: providers.find(p => p.id === realm.providerId) || null,
        },
      };
    },
  },

  // 创建 realm
  {
    url: '/api/realms',
    method: 'POST',
    response: ({ body }) => {
      const newRealm = {
        pk: Date.now(),
        id: `realm-${Date.now()}`,
        ...body,
      };
      realms.push(newRealm);
      return { code: 0, message: 'OK', data: newRealm };
    },
  },

  // 更新 realm
  {
    url: '/api/realms/:id',
    method: 'PUT',
    response: ({ params, body }) => {
      const index = realms.findIndex(r => r.id === params.id);
      if (index > -1) {
        realms[index] = { ...realms[index], ...body };
        return { code: 0, message: 'OK', data: realms[index] };
      }
      return { code: 404, message: 'Not found', data: null };
    },
  },

  // 删除 realm
  {
    url: '/api/realms/:id',
    method: 'DELETE',
    response: ({ params }) => {
      const index = realms.findIndex(r => r.id === params.id);
      if (index > -1) {
        realms.splice(index, 1);
        return { code: 0, message: 'OK', data: null };
      }
      return { code: 404, message: 'Not found', data: null };
    },
  },

  // 获取所有 providers
  {
    url: '/api/providers',
    method: 'GET',
    response: () => {
      return {
        code: 0,
        message: 'OK',
        data: providers,
      };
    },
  },

  // 创建 provider
  {
    url: '/api/providers',
    method: 'POST',
    response: ({ body }) => {
      const newProvider = {
        id: Date.now(),
        ...body,
      };
      providers.push(newProvider);
      return { code: 0, message: 'OK', data: newProvider };
    },
  },
  // 绑定realm
  {
    url: '/api/realms/bind',
    method: 'POST',
    response: ({ body }) => {
      return {
        code: 0,
        message: 'OK',
        data: {
          realmId: body.realmId,
          status: 'bound',
        },
      };
    },
  },
  // 解除绑定
  {
    url: '/api/realms/bind',
    method: 'DELETE',
    response: () => {
      return {
        code: 0,
        message: 'OK',
        data: {
          status: 'unbound',
        },
      };
    },
  },
]);
