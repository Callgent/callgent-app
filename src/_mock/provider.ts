import { defineFakeRoute } from 'vite-plugin-fake-server/client';
import { providers } from './response';

export default defineFakeRoute([
  // 获取所有 providers
  {
    url: '/api/providers',
    method: 'GET',
    response: () => ({
      code: 0,
      message: 'OK',
      data: providers,
    }),
  },

  // 获取单个 provider
  {
    url: '/api/providers/:id',
    method: 'GET',
    response: ({ params }) => {
      const provider = providers.find(p => p.id === Number(params.id));
      if (!provider) {
        return { code: 404, message: 'Not found', data: null };
      }
      return { code: 0, message: 'OK', data: provider };
    },
  },

  // 删除 provider
  {
    url: '/api/providers/:id',
    method: 'DELETE',
    response: ({ params }) => {
      const index = providers.findIndex(p => p.id === Number(params.id));
      if (index > -1) {
        providers.splice(index, 1);
        return { code: 0, message: 'OK', data: null };
      }
      return { code: 404, message: 'Not found', data: null };
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
]);
