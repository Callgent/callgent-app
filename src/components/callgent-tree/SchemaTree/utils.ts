// 类型列表
export const typeOptions = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
];

export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// 查找2XX的响应
export function extractFirst2xxJsonSchema(openapiResponses: any): any | null {
  try {
    const statusCodes = Object.keys(openapiResponses).filter(code => /^2\d\d$/.test(code))
    for (const status of statusCodes) {
      const response = openapiResponses[status]
      const content = response?.content
      const json = content?.["application/json"]
      if (json?.schema?.properties) {
        return json.schema
      }
    }
    // message.error("Unsupported response type")
    return null
  } catch (error) {
    return null
  }
}

export const createSchemaNode = (
  type: "string" | "object" = "string",
  name = ""
): any => ({
  id: generateId(),
  name,
  editingName: true,
  type,
  required: true,
  in: "body",
  ...(type === "object" ? { children: [] } : {}),
});

export const addSchemaChild = (tree: any, parentId: string): any => {
  const walk = (node: any): any => {
    if (parentId === "root") {
      return {
        ...node,
        children: [...(node.children || []), createSchemaNode()],
      };
    }
    if (node.id === parentId) {
      if (node.type === "object") {
        return {
          ...node,
          children: [...(node.children || []), createSchemaNode()],
        };
      }
      if (node.type === "array") {
        const children = node.children || [];
        // 模板项：优先从 children[0] 取，否则 fallback 到 node.item
        const template = children[0] || node.item;

        // 如果还没有任何子项，先初始化第一个
        if (!template) {
          // 根据 node.item?.type 决定是对象还是基础类型，默认对象
          const baseType = node.item?.type || "object";
          let first;
          if (baseType === "object") {
            // 对象数组
            first = createSchemaNode("object", "item-1");
          } else {
            // 基础类型数组
            first = {
              ...createSchemaNode(baseType as any, "item-1"),
              default: "",
            };
          }
          return {
            ...node,
            children: [first],
            // 清掉旧的 item 字段（可选）
            item: undefined,
          };
        }

        // 已有子项，克隆模板
        // 深度克隆并保留 default
        const cloneNode = (n: any): any => {
          const newId = generateId();
          const copy: any = { ...n, id: newId };
          if (Array.isArray(n.children)) {
            copy.children = n.children.map(cloneNode);
          }
          return copy;
        };
        // 对象类型数组
        if (template.type === "object") {
          const newItem = cloneNode(template);
          newItem.name = `item-${children.length + 1}`;
          return {
            ...node,
            children: [...children, newItem],
            item: undefined,
          };
        } else {
          // 基础类型数组
          const newLeaf = {
            ...template,
            id: generateId(),
            name: `item-${children.length + 1}`,
            default: template.default ?? "",
          };
          return {
            ...node,
            children: [...children, newLeaf],
            item: undefined,
          };
        }
      }
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map(walk),
      };
    }
    if (node.item) {
      return {
        ...node,
        item: walk(node.item),
      };
    }
    return node;
  };
  return walk(tree);
};

// schema转options
export function flattenSchemaToMentions(schema: any, parentPath = ""): any[] {
  const result: any[] = [];

  if (schema.type === "object" && schema.properties) {
    for (const key in schema.properties) {
      const prop = schema.properties[key];
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      result.push(...flattenSchemaToMentions(prop, currentPath));
    }
  } else if (schema.type === "array" && schema.items) {
    // 用 [] 表示数组字段
    const currentPath = parentPath + "[]";
    result.push(...flattenSchemaToMentions(schema.items, currentPath));
  } else {
    // 基础类型字段
    const field = parentPath;
    result.push({
      value: `${field}}}`,
      label: field,
    });
  }

  return result;
}

// 区分in body
export function categorizeNodes(nodes: any): { body?: any; data: any[] } {
  const result: any = { data: [], body: [] };
  if (!nodes?.children) {
    return result;
  }
  nodes?.children.forEach((node: any) => {
    if (node.in === "body" || !node.in) {
      result.body.push(node);
    } else {
      result.data.push({
        ...node,
        schema: { type: node.type, default: node.default },
      });
    }
  });
  const body = treeNodeToJsonSchema({
    id: "root",
    name: "",
    editingName: false,
    type: "object",
    required: false,
    in: "body",
    children: result.body,
  });
  const data = result.data;
  return { body, data };
}

// 将 JSON Schema 转成内部树节点
export function jsonSchemaToTreeNode(
  schema: any,
  name = "",
  inLocation = "body"
): any {
  if (!schema) return null;
  // 先浅拷贝 schema，排除递归用的字段 properties, items
  const { properties, items, required: schemaRequired, ...rest } = schema;
  const node: any = {
    ...rest,
    id: generateId(),
    name,
    editingName: false,
    required: false,
    in: inLocation,
  };
  // 递归处理子节点
  if (schema.type === "object") {
    node.children = [];
    const props = properties || {};
    for (const key of Object.keys(props)) {
      const childSchema = props[key];
      const childNode = jsonSchemaToTreeNode(childSchema, key, inLocation);
      childNode.required =
        Array.isArray(schemaRequired) && schemaRequired.includes(key);
      node.children.push(childNode);
    }
  }
  if (schema.type === "array" && items) {
    node.children = [];

    if (items?.default && Array.isArray(items.default)) {
      const defaults = items.default;

      // 判断是对象数组还是基础类型数组
      if (items.type === "object") {
        for (let i = 0; i < defaults.length; i++) {
          const defaultEntry = defaults[i];
          const clonedItems = JSON.parse(JSON.stringify(items));

          if (clonedItems.properties) {
            for (const key in clonedItems.properties) {
              if (defaultEntry[key] !== undefined) {
                clonedItems.properties[key].default = defaultEntry[key];
              }
            }
          }

          delete clonedItems.default;
          clonedItems.parentType = "array";

          const itemNode = jsonSchemaToTreeNode(
            clonedItems,
            `item-${i + 1}`,
            inLocation
          );
          node.children.push(itemNode);
        }
      } else {
        for (let i = 0; i < defaults.length; i++) {
          const value = defaults[i];
          const itemNode = jsonSchemaToTreeNode(
            {
              ...items,
              default: value,
              parentType: "array",
            },
            `item-${i + 1}`,
            inLocation
          );
          node.children.push(itemNode);
        }
      }
    } else {
      // 没有默认值，添加一个空的 item 节点
      items.parentType = "array";
      node.children.push(jsonSchemaToTreeNode(items, "item", inLocation));
    }
  }
  return node;
}

// tree转schema
export function treeNodeToJsonSchema(node: any): any {
  if (!node) return null;
  const {
    children,
    item,
    required,
    editingName,
    id,
    name,
    in: inLocation,
    ...rest
  } = node;
  const s: any = {
    ...rest,
    type: node.type,
  };
  if (node.type === "object") {
    s.properties = {};
    const reqs: string[] = [];
    children?.forEach((c: any) => {
      s.properties[c.name] = treeNodeToJsonSchema(c);
      if (c.required) reqs.push(c.name);
    });
    if (reqs.length) s.required = reqs;
  }
  if (node.type === "array") {
    const itemType = node.children[0]?.type || "string";
    if (itemType === "object" && Array.isArray(children)) {
      const allProperties: Record<string, any> = {};
      const requiredFields = new Set<string>();
      const defaultArray: any[] = [];
      for (const child of children) {
        const itemSchema = treeNodeToJsonSchema(child);

        if (itemSchema?.properties) {
          for (const key in itemSchema.properties) {
            if (!allProperties[key]) {
              const prop = itemSchema.properties[key];
              delete prop.default;
              allProperties[key] = prop;
            }
          }
        }

        if (itemSchema?.required) {
          itemSchema.required.forEach((key: string) => requiredFields.add(key));
        }

        const defaultItem: Record<string, any> = {};
        if (child.children) {
          for (const field of child.children) {
            if (field.default !== undefined) {
              defaultItem[field.name] = field.default;
            }
          }
        }

        defaultArray.push(defaultItem);
      }
      s.items = {
        type: "object",
        properties: allProperties,
      };
      if (requiredFields.size) {
        s.items.required = Array.from(requiredFields);
      }
      if (defaultArray.length) {
        s.items.default = defaultArray;
      }
    } else if (!["object"].includes(itemType)) {
      s.items = {
        type: itemType,
      };
      const defaultArray: any[] = [];
      if (Array.isArray(children)) {
        for (const child of children) {
          if (child.default !== undefined) {
            defaultArray.push(child.default);
          }
        }
      }
      if (defaultArray.length) {
        s.items.default = defaultArray;
      }
    }
  }

  return s;
}

/**
 * 在指定 array 节点的 children 中新增一个 item
 */
export function addArrayItemNode(tree: any, arrayNodeId: string): any {
  const walk = (node: any): any => {
    if (node.id === arrayNodeId && node.type === "array") {
      const children = node.children || [];

      // 如果已经有 children，取第一个为模板
      if (children.length > 0) {
        const template = children[0];

        // 对象数组：深度克隆并保留 default
        if (template.type === "object") {
          // 保存模板的 default 值
          const defaults = template.children?.map((c: any) => c.default);

          // 深克隆模板节点
          const clone = (n: any): any => {
            const newId = generateId();
            const copy: any = { ...n, id: newId };
            if (Array.isArray(n.children)) {
              copy.children = n.children.map(clone);
            }
            return copy;
          };
          const newItem = clone(template);
          newItem.name = `item-${children.length + 1}`;
          // 把 default 赋回去
          newItem.children.forEach((c: any, idx: number) => {
            if (defaults[idx] !== undefined) c.default = defaults[idx];
          });

          return {
            ...node,
            children: [...children, newItem],
          };
        }

        // 原始类型数组：只克隆一个 leaf 节点，保留模板 default
        const newLeaf = {
          ...template,
          id: generateId(),
          name: `item-${children.length + 1}`,
          default: template.default ?? "",
        };
        return {
          ...node,
          children: [...children, newLeaf],
        };
      }

      // 如果还没有 children，就先初始化第一个 item
      // 从 node.item.type（或者 schemaType）里拿类型，否则默认 string
      const baseType = node.item?.type || "string";
      let firstItem: any;

      if (baseType === "object") {
        // 对象数组，调用 createSchemaNode 生成空对象
        firstItem = createSchemaNode("object", "item-1");
      } else {
        // 原始类型数组，手动生成 leaf
        firstItem = {
          id: generateId(),
          name: "item-1",
          type: baseType,
          required: false,
          in: node.in,
          editingName: false,
          default: "",
        };
      }
      return {
        ...node,
        children: [firstItem],
      };
    }
    // 递归遍历
    if (node.children) {
      return { ...node, children: node.children.map(walk) };
    }
    return node;
  };
  return walk(tree);
}

// schema
export function injectDefaults(schema: any, data: any): any {
  if (!schema) return schema
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

// parameters
export function injectParametersDefaults(parameters: any[], data: any = {}): any {
  return parameters.map((item) => ({
    ...item,
    default: data[item?.name] ?? null,
    schema: {
      ...item.schema,
      default: data[item?.name] ?? null
    }
  }))
}

// Request methods
export const requestMethods = [
  { value: 'GET', description: 'Retrieve data' },
  { value: 'POST', description: 'Create new data' },
  { value: 'PUT', description: 'Update/replace data' },
  { value: 'PATCH', description: 'Partially update data' },
  { value: 'DELETE', description: 'Remove data' },
  { value: 'HEAD', description: 'Get metadata (no body)' },
  { value: 'OPTIONS', description: 'List allowed methods' },
  { value: 'CONNECT', description: 'Establish tunnel connection' },
  { value: 'TRACE', description: 'Echoes request (debugging)' },
]

export const getParams = (formData: any) => {
  return [...formData?.parameters, ...(jsonSchemaToTreeNode(formData?.requestBody).children as [])]
}