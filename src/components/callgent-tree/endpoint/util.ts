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

// Convert config object to OpenAPI 3.0 specification format
export function convertToOpenAPI(config: any) {
  const { path, operationId, whatFor, requestBody, how2Ops } = config;
  const method = config.endpointConfig?.method?.toLowerCase() || 'get';

  // Map parameters to OpenAPI parameter objects
  const parameters = (config.parameters || []).map((p: any) => {
    return {
      name: p.name,
      // Note: 'params' here maps to 'query', 'path' to 'path' in OpenAPI
      in: p.method === 'params' ? 'query' : 'path',
      required: p.method === 'path',
      description: p.describe,
      schema: {
        type: p.type || 'string',
        default: p.default,
      },
    };
  });

  // Map responses to properties object for schema
  const properties: Record<string, any> = {};

  (config.responses || []).forEach((r: any) => {
    properties[r.name] = {
      type: r.type || 'string',
      description: r.describe,
      default: r.default,
    };
  });

  // Construct standard 200 response schema
  const responses = {
    "200": {
      description: "Successful response",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties,
          },
        },
      },
    },
  };
  // Return OpenAPI 3.0 specification object
  return {
    openapi: "3.0.0",
    paths: {
      [path]: {
        [method]: {
          operationId,
          how2exe: config?.endpointConfig?.how2exe || null,
          whatFor,
          parameters,
          requestBody,
          responses,
          how2Ops,
        },
      },
    },
  };
}
