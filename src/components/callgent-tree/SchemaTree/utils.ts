import { unsavedGuard } from "@/router/utils";

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
    const statusCodes = Object.keys(openapiResponses).filter((code) =>
      /^2\d\d$/.test(code)
    );
    for (const status of statusCodes) {
      const response = openapiResponses[status];
      const content = response?.content;
      const json = content?.["application/json"];
      if (json?.schema?.properties) {
        return json.schema;
      }
    }
    // message.error("Unsupported response type")
    return null;
  } catch (error) {
    return null;
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
  in: "query",
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
          const baseType = node.item?.type || "string";
          let first;
          if (baseType === "object") {
            // 对象数组
            first = createSchemaNode("object", "item");
          } else {
            // 基础类型数组
            first = {
              ...createSchemaNode(baseType as any, "item"),
              parentType: "array",
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
          newItem.name = `item`;
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
            name: `item`,
            default: template.default ?? `{{''}}`,
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

// 将 JSON Schema 转成内部树节点
export function jsonSchemaToTreeNode(
  schema: any,
  name = "",
  inLocation = "query"
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
  if (node?.length < 1) return { type: "object", properties: {} };

  const {
    children,
    item,
    required,
    editingName,
    id,
    name,
    in: inLocation,
    default: nodeDefault,
    ...rest
  } = node;

  // 格式化 default 值，空字符串转为 {{''}}
  function formatDefault(def: any) {
    if (def === "") return "{{''}}";
    return def;
  }
  const s: any = {
    ...rest,
    type: node.type,
  };
  // 1. object 类型
  if (node.type === "object") {
    s.properties = {};
    const reqs: string[] = [];
    children?.forEach((c: any) => {
      s.properties[c.name] = treeNodeToJsonSchema(c);
      if (c.required) reqs.push(c.name);
    });
    if (reqs.length) s.required = reqs;
    if (nodeDefault !== undefined) {
      s.default = formatDefault(nodeDefault);
    }
    return s;
  }
  // 2. array 类型
  if (node.type === "array") {
    // 数组本身有 default
    if (nodeDefault !== undefined) {
      s.default = Array.isArray(nodeDefault)
        ? nodeDefault.map(formatDefault)
        : formatDefault(nodeDefault);
    }
    // 统一使用 items: [schema1, schema2, ...] 格式
    if (Array.isArray(children)) {
      const itemsArray: any[] = [];
      for (const child of children) {
        const itemSchema = treeNodeToJsonSchema(child);
        itemsArray.push(itemSchema);
      }
      s.items = itemsArray;
    } else {
      const itemType = node.children?.[0]?.type || "string";
      s.items = { type: itemType };
    }
    return s;
  }
  // 3. 基本类型（string、number、boolean 等）
  if (nodeDefault !== undefined) {
    s.default = formatDefault(nodeDefault);
  }
  return s;
}

// tree to schema
export function treeToSchema(node: any) {
  return treeNodeToJsonSchema({
    "type": "object",
    "id": "1753844670780_h9d22o",
    "name": "",
    "editingName": false,
    "required": false,
    "in": "query",
    "children": node
  })
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
      const baseType = "string";
      let firstItem: any;
      firstItem = {
        id: generateId(),
        name: "item-1",
        type: baseType,
        required: false,
        in: node.in,
        editingName: false,
        default: "",
      };
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

// parameters
export function injectParametersDefaults(
  parameters: any[],
  data: any = {}
): any {
  return parameters.map((item) => ({
    ...item,
    default: data[item?.name] ?? null,
    schema: {
      ...item.schema,
      default: data[item?.name] ?? null,
    },
  }));
}

// Request methods
export const requestMethods = [
  { value: "GET", description: "Retrieve data" },
  { value: "POST", description: "Create new data" },
  { value: "PUT", description: "Update/replace data" },
  { value: "PATCH", description: "Partially update data" },
  { value: "DELETE", description: "Remove data" },
  { value: "HEAD", description: "Get metadata (no body)" },
  { value: "OPTIONS", description: "List allowed methods" },
  { value: "CONNECT", description: "Establish tunnel connection" },
  { value: "TRACE", description: "Echoes request (debugging)" },
];

export const getParams = (formData: any) => {
  return [
    ...formData?.parameters,
    ...formData?.requestBody,
  ];
};

// 更新节点
export const updateNode = (tree: any, id: string, partial: any) => {
  unsavedGuard.setUnsavedChanges(true);
  const walk = (n: any): any => {
    if (n.id === id) {
      const isTypeChangeToArray = ["array", "object"].includes(partial?.type);
      const updated = { ...n, ...partial };
      if (!isTypeChangeToArray && partial?.type !== undefined) {
        updated.children = [];
      }
      return updated;
    }
    if (n.children) {
      return { ...n, children: n.children.map(walk) };
    }
    if (n.item) {
      return { ...n, item: walk(n.item) };
    }
    return n;
  };
  return walk(tree);
};

// 删除节点
export const deleteNode = (tree: any, id: string) => {
  const walk = (n: any): any => {
    if (n.children) {
      n.children = n.children.filter((c: any) => c.id !== id).map(walk);
    }
    if (n.item?.id === id) {
      n.item = undefined;
    } else if (n.item) {
      n.item = walk(n.item);
    }
    return { ...n };
  };
  return walk(tree);
};
