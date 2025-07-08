// Request methods
export const requestMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'].map(m => ({
  value: m,
  label: m,
}));

export const requestLocations = [
  { label: 'Query (URL query parameters)', value: 'query' },
  { label: 'Path (path parameters)', value: 'path' },
  { label: 'Header (request headers)', value: 'header' },
  { label: 'Cookie (HTTP cookies)', value: 'cookie' },
  { label: 'Body (request body)', value: 'body' },
  { label: 'Form (application/x-www-form-urlencoded)', value: 'form' },
  { label: 'Multipart (multipart/form-data)', value: 'multipart' },
]

// Field types (fixed options)
export const fieldTypes = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'object', value: 'object' },
  { label: 'array', value: 'array' },
];

import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
export const getSchema = (data: any) => {
  const parameters = data?.parameters || []
  const parameters_schema: any = {
    type: 'object',
    properties: {},
    required: []
  }
  for (const param of parameters) {
    const originalSchema = param.schema
    let jsonSchema = openapiSchemaToJsonSchema(originalSchema)
    if (param.description) {
      jsonSchema.description = param.description || null
    }
    parameters_schema.properties[param.name] = jsonSchema
    if (param.required) {
      parameters_schema.required.push(param.name)
    }
  }
  if (parameters_schema.required.length === 0) {
    delete parameters_schema.required
  }
  return parameters_schema
}

/**
 * Recursively injects actual data into the `default` fields of a JSON Schema.
 */
export function injectDefaults(schema: any, data: any): any {
  if (!schema) return schema
  // object
  if (schema.type === 'object' && schema.properties && typeof data === 'object' && data !== null) {
    const newProperties: any = {}
    for (const key in schema.properties) {
      const propSchema = schema.properties[key]
      const propValue = data?.[key]
      newProperties[key] = injectDefaults(propSchema, propValue)
    }
    return {
      ...schema,
      properties: newProperties
    }
  }
  // array
  if (schema.type === 'array' && Array.isArray(data)) {
    const itemsSchema = schema.items
    if (itemsSchema && typeof itemsSchema === 'object') {
      return {
        ...schema,
        default: data,
        items: itemsSchema
      }
    }
    return { ...schema, default: data }
  }
  return { ...schema, default: data }
}

export function extractFirst2xxJsonSchema(openapiResponses: any): any | null {
  try {
    const statusCodes = Object.keys(openapiResponses).filter(code => /^2\d\d$/.test(code))
    for (const status of statusCodes) {
      const response = openapiResponses[status]
      const content = response?.content
      const json = content?.["application/json"]
      if (json?.schema) {
        return json.schema
      }
    }
    return null
  } catch (error) {
    return null
  }
}