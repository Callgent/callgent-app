import type { TreeNodeData } from "./type";

// 类型列表
export const typeOptions = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
];

/**
 * 根据ID查找树节点
 * @param nodes 树节点数组
 * @param id 节点ID
 * @returns 找到的节点或undefined
 */
export const findNodeById = (
  nodes: TreeNodeData[],
  id: number
): TreeNodeData | undefined => {
  return nodes.find((node) => node.id === id);
};

/**
 * 将树节点数据转换为OpenAPI Schema对象
 * @param node 树节点数据
 * @returns 对应的OpenAPI Schema对象
 */
const convertNodeToSchema = (
  node: TreeNodeData,
  allNodes: TreeNodeData[]
): any => {
  const schema: any = {
    type: node.type,
  };

  if (node.description) {
    schema.description = node.description;
  }

  if (node.defaultValue !== undefined) {
    schema.default = node.defaultValue;
  }

  if (node.enum) {
    schema.enum = node.enum;
  }

  if (node.type === "object") {
    schema.properties = {};
    const requiredFields: string[] = [];
    const children = allNodes.filter((child) => child.parentId === node.id);
    children.forEach((child) => {
      schema.properties[child.name] = convertNodeToSchema(child, allNodes);
      if (child.required) {
        requiredFields.push(child.name);
      }
    });
    if (requiredFields.length > 0) {
      schema.required = requiredFields;
    }
  } else if (node.type === "array") {
    const children = allNodes.filter((child) => child.parentId === node.id);
    if (children.length > 0) {
      schema.items = children.map((child) =>
        convertNodeToSchema(child, allNodes)
      );
    } else {
      // Default to array of strings if no children are specified
      schema.items = [{ type: "string" }];
    }
  }

  return schema;
};

/**
 * 将树结构转换为OpenAPI规范对象
 * @param tree 树节点数据数组
 * @param treeType 树的类型 (requestBody, parameters, responses)
 * @returns 对应的OpenAPI规范对象
 */
export const convertTreeToOpenApi = (
  tree: TreeNodeData[],
  treeType: "requestBody" | "parameters" | "responses"
): any => {
  if (tree.length === 0) {
    if (["requestBody", "responses"].includes(treeType)) { return {} }
    else { return [] }
  }

  if (["requestBody", "responses"].includes(treeType)) {
    if (tree.length === 1) {
      const rootNode = tree[0];
      return convertNodeToSchema(
        {
          ...rootNode,
          children: tree.filter((child) => child.parentId === rootNode.id),
        },
        tree
      );
    } else {
      const properties: any = {};
      const requiredFields: string[] = [];
      tree
        .filter((node) => node.parentId === 0)
        .forEach((node) => {
          properties[node.name] = convertNodeToSchema(
            {
              ...node,
              children: tree.filter((child) => child.parentId === node.id),
            },
            tree
          );
          if (node.required) {
            requiredFields.push(node.name);
          }
        });

      return {
        type: "object",
        properties: properties,
        ...(requiredFields.length > 0 && { required: requiredFields }),
      };
    }
  } else if (treeType === "parameters") {
    const parameters: any[] = [];
    tree.forEach((node) => {
      parameters.push({
        name: node.name,
        in: node.in,
        description: node.description,
        required: node.required,
        schema: convertNodeToSchema(node, tree),
      });
    });
    return parameters;
  }
};

/**
 * 将OpenAPI Schema对象转换为树节点数据
 * @param name 节点名称
 * @param schema OpenAPI Schema对象
 * @param parentId 父节点ID
 * @param depth 节点深度
 * @param requiredFields 必填字段数组
 * @param inProperty 参数位置 (query, header, path, cookie)
 * @param generateId 用于生成唯一ID的函数
 * @returns 树节点数据
 */
const convertSchemaToNode = (
  name: string,
  schema: any,
  parentId: number,
  parentName: string, // Added
  depth: number,
  requiredFields: string[] = [],
  inProperty?: "query" | "header" | "path" | "cookie",
  generateId: () => number = () => Date.now() + Math.floor(Math.random() * 1000) // Default to previous method if not provided
): TreeNodeData[] => {
  const id = generateId(); // Use the provided ID generator
  const _id = parentName ? `${parentName}_${name}` : name; // Added
  const node: TreeNodeData = {
    id,
    _id, // Added
    name,
    type: schema.type || "string",
    parentId,
    depth,
    description: schema.description,
    defaultValue: schema.default,
    required: requiredFields.includes(name) || schema.required || false,
    enum: schema.enum,
    in: inProperty,
  };

  const nodes: TreeNodeData[] = [node];

  if (schema.type === "object" && schema.properties) {
    Object.entries(schema.properties).forEach(([propName, propSchema]) => {
      nodes.push(
        ...convertSchemaToNode(
          propName,
          propSchema,
          id,
          _id, // Added
          depth + 1,
          schema.required || [],
          inProperty,
          generateId
        )
      );
    });
  } else if (schema.type === "array" && schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items.forEach((itemSchema: any) => {
        nodes.push(
          ...convertSchemaToNode(
            "item",
            itemSchema,
            id,
            _id,
            depth + 1,
            [],
            inProperty,
            generateId
          )
        );
      });
    } else {
      nodes.push(
        ...convertSchemaToNode(
          "item",
          schema.items,
          id,
          _id,
          depth + 1,
          [],
          inProperty,
          generateId
        )
      );
    }
  }

  return nodes;
};

/**
 * 将OpenAPI规范对象转换为树结构
 * @param openApiSchema OpenAPI规范对象
 * @param treeType 树的类型 (requestBody, parameters, responses)
 * @returns 树节点数据数组
 */
export const convertOpenApiToTree = (
  openApiSchema: any,
  treeType: "requestBody" | "parameters" | "responses"
): TreeNodeData[] => {
  let tree: TreeNodeData[] = [];
  let idCounter = 1; // Start ID counter from 1

  const generateUniqueId = () => idCounter++;

  if (["requestBody", "responses"].includes(treeType)) {
    const requestBodyContent = openApiSchema;
    if (requestBodyContent) {
      if (
        requestBodyContent.type === "object" &&
        requestBodyContent.properties
      ) {
        Object.entries(requestBodyContent.properties).forEach(
          ([name, schema]) => {
            tree.push(
              ...convertSchemaToNode(
                name,
                schema,
                0,
                "", // Added parentName
                0,
                requestBodyContent.required || [],
                undefined,
                generateUniqueId
              )
            );
          }
        );
      } else {
        // Handle single root schema (e.g., a string or array directly as request body)
        tree.push(
          ...convertSchemaToNode(
            "root",
            requestBodyContent,
            0,
            "", // Added parentName
            0,
            requestBodyContent.required || [],
            undefined,
            generateUniqueId
          )
        );
      }
    }
  } else if (treeType === "parameters") {
    if (Array.isArray(openApiSchema)) {
      openApiSchema.forEach((param) => {
        if (param.schema) {
          tree.push(
            ...convertSchemaToNode(
              param.name,
              param.schema,
              0,
              "", // Added parentName
              0,
              [],
              param.in,
              generateUniqueId
            )
          );
        }
      });
    }
  }
  return tree;
};

// 合并默认值
export const mergeSchemasWithDefaults = (
  targetSchema: any,
  defaultsSchema: any
) => {
  if (!targetSchema || !defaultsSchema) {
    return;
  }

  // Handle default value at the current level
  if (defaultsSchema.default !== undefined) {
    targetSchema.default = defaultsSchema.default;
  }

  // Handle properties for object types
  if (targetSchema.type === "object" && defaultsSchema.properties) {
    if (!targetSchema.properties) {
      targetSchema.properties = {};
    }
    for (const key in defaultsSchema.properties) {
      if (targetSchema.properties[key]) {
        mergeSchemasWithDefaults(
          targetSchema.properties[key],
          defaultsSchema.properties[key]
        );
      } else {
        // Property exists in defaults but not in target, so add it.
        targetSchema.properties[key] = defaultsSchema.properties[key];
      }
    }
  }

  // Handle items for array types
  if (
    targetSchema.type === "array" &&
    targetSchema.items &&
    defaultsSchema.items
  ) {
    // Case where target has a single schema object and defaults has an array of schemas
    if (
      !Array.isArray(targetSchema.items) &&
      Array.isArray(defaultsSchema.items)
    ) {
      // Convert the target's single item schema into an array of schemas based on the defaults
      const newItemsArray: any[] = [];
      defaultsSchema.items.forEach((defaultItem: any, index: number) => {
        // Create a new schema for this item, starting with a copy of the target's original item schema
        const newItemSchema = JSON.parse(JSON.stringify(targetSchema.items));
        // Merge the defaults for this specific item
        mergeSchemasWithDefaults(newItemSchema, defaultItem);
        newItemsArray.push(newItemSchema);
      });
      targetSchema.items = newItemsArray;
    } else if (
      Array.isArray(targetSchema.items) &&
      Array.isArray(defaultsSchema.items)
    ) {
      // If both are arrays, merge them item by item
      defaultsSchema.items.forEach((defaultItem: any, index: number) => {
        if (targetSchema.items[index]) {
          mergeSchemasWithDefaults(targetSchema.items[index], defaultItem);
        }
      });
    } else if (
      !Array.isArray(targetSchema.items) &&
      !Array.isArray(defaultsSchema.items)
    ) {
      // If both are single objects
      mergeSchemasWithDefaults(targetSchema.items, defaultsSchema.items);
    }
  }
  return targetSchema;
};
export const mergeParametersWithDefaults = (
  targetParameters: any[],
  defaultParameters: any[]
) => {
  defaultParameters.forEach((defaultParam) => {
    const targetParam = targetParameters.find(
      (tp) => tp.name === defaultParam.name
    );
    if (
      targetParam &&
      defaultParam.schema &&
      defaultParam.schema.default !== undefined
    ) {
      if (!targetParam.schema) {
        targetParam.schema = {};
      }
      targetParam.schema = defaultParam.schema;
      targetParam.default = defaultParam.schema.default;
    }
  });
  return targetParameters;
};