/**
 * @doc https://umijs.org/en-US/docs/guides/proxy
 */

export default {
  dev: {
    '/api/': {
      target: process.env.API_URL,
      changeOrigin: true,
    },
  },
};
