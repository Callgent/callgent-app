// Request methods
export const requestMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'].map(m => ({
  value: m,
  label: m,
}));

// Parameter locations
export const requestLocations = [
  { label: 'Query (URL query parameters)', value: 'query' },
  { label: 'Params (path parameters)', value: 'params' },
  { label: 'Body (request body)', value: 'body' },
  { label: 'Header (request header)', value: 'header' },
];

// Field types (fixed options)
export const fieldTypes = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'object', value: 'object' },
  { label: 'array', value: 'array' },
];

// api列表
export const apiList = {
  "endpoints": [
    {
      "id": "esW3GgQl8-0qDJ_vvtphv",
      "name": "GET /OAuthClientController_oauthStart",
      "callgentId": "euXexUmhK0ruEc-qQQwl1"
    },
    {
      "id": "esW361MTmZlwwQxk0yBGu",
      "name": "GET /OAuthClientController_oauthCallback",
      "callgentId": "euXexUmhK0ruEc-qQQwl1"
    }
  ],
  "sentries": [
    {
      "id": "root",
      "name": "root",
      "host": "callgent-interface",
      "adaptor": "Callgent",
      "interfaceUri": null,
      "callgentIds": [
        "euXexUmhK0ruEc-qQQwl1"
      ]
    }
  ]
}
