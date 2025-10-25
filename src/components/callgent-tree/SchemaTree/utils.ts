import { unsavedGuard } from "@/router/utils";

import type { TreeNodeData } from "./types";

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
export function extractFirst2xxJsonSchema(openapiResponses: any, apiMap: any = null): any | null {
  try {

    let statusCodes = Object.keys(openapiResponses).filter((code) => {
      return /^2\d\d$/.test(code)
    });
    if (apiMap?.responses) {
      statusCodes = [Object.keys(apiMap.responses)[0]];
    }
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
  name = "",
  parentId?: string
): any => {
  // 根据是否有 parentId 来生成 id
  const id = parentId ? `${parentId}_${name}` : "root_";
  return {
    id,
    name,
    editingName: true,
    type,
    required: true,
    in: "query",
    ...(type === "object" ? { children: [] } : {}),
  };
};

export const addSchemaChild = (tree: any, parentId: string): any => {
  const walk = (node: any): any => {
    if (parentId === "root") {
      return {
        ...node,
        children: [...(node.children || []), createSchemaNode("string", "")],
      };
    }
    if (node.id === parentId) {
      if (node.type === "object") {
        return {
          ...node,
          children: [...(node.children || []), createSchemaNode(node.type, '', node.id)],
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
            first = createSchemaNode("object", "item_1");
          } else {
            // 基础类型数组
            first = {
              ...createSchemaNode(baseType as any, "item_1"),
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
        const cloneNode = (n: any, newParentId: string): any => {
          // 生成新的 id
          const newId = `${newParentId}`;
          const copy: any = {
            ...n,
            id: newId,
            parentId: newParentId, // 设置新的 parentId
          };
          if (Array.isArray(n.children)) {
            copy.children = n.children.map((child: any) => {
              return cloneNode(child, `${newId}_${child.name}`);
            });
          }
          return copy;
        };
        // 对象类型数组
        if (template.type === "object") {
          const itemIdx = `item_${children.length + 1}`;
          const newItem = cloneNode(template, `${node.id}_${itemIdx}`);
          newItem.name = itemIdx;
          return {
            ...node,
            children: [...children, newItem],
            item: undefined,
          };
        } else {
          // 基础类型数组
          const itemIdx = `item_${children.length + 1}`;
          const newLeaf = {
            ...template,
            id: `${parentId}_${itemIdx}`,
            name: itemIdx,
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

// 将 JSON Schema 转成内部树节点
export function jsonSchemaToTreeNode(
  schema: any,
  name = "",
  inLocation = "query",
  parentId = "" // 添加 parentId 参数
): any {
  if (!schema) return null;

  // 构建当前节点的 ID
  const currentId = parentId ? `${parentId}_${name}` : "root";

  // 先浅拷贝 schema，排除递归用的字段 properties, items
  const { properties, items, required: schemaRequired, ...rest } = schema;
  const node: any = {
    ...rest,
    id: currentId,
    name,
    editingName: false,
    required: false,
    in: inLocation,
    schema: {
      type: schema.type,
      default: schema?.default,
    },
  };
  // 递归处理子节点
  if (schema.type === "object") {
    node.children = [];
    const props = properties || {};
    for (const key of Object.keys(props)) {
      const childSchema = props[key];
      const childNode = jsonSchemaToTreeNode(
        childSchema,
        key,
        inLocation,
        currentId // 传递当前节点 ID 作为父 ID
      );
      childNode.required =
        Array.isArray(schemaRequired) && schemaRequired.includes(key);
      node.children.push(childNode);
    }
  }
  if (schema.type === "array" && items) {
    node.children = [];
    if (Array.isArray(items)) {
      // items 是数组，说明是元组（tuple）类型，每个 item 可能结构不同
      items.forEach((item, index) => {
        const itemNode = jsonSchemaToTreeNode(
          {
            ...item,
            parentType: "array",
          },
          `item_${index + 1}`,
          inLocation,
          currentId
        );
        node.children.push(itemNode);
      });
    } else {
      // items 是对象，说明是统一类型数组
      let item = items;
      if (item?.default && Array.isArray(item.default)) {
        const defaults = item.default;
        if (item.type === "object") {
          for (let i = 0; i < defaults.length; i++) {
            const defaultEntry = defaults[i];
            const clonedItems = JSON.parse(JSON.stringify(item));
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
              `item_${i + 1}`,
              inLocation,
              currentId
            );
            node.children.push(itemNode);
          }
        } else {
          for (let i = 0; i < defaults.length; i++) {
            const value = defaults[i];
            const itemNode = jsonSchemaToTreeNode(
              {
                ...item,
                default: value,
                parentType: "array",
              },
              `item_${i + 1}`,
              inLocation,
              currentId
            );
            node.children.push(itemNode);
          }
        }
      } else {
        // 没有默认值，添加一个空的 item 节点
        item.parentType = "array";
        const itemNode = jsonSchemaToTreeNode(
          item,
          "item_1",
          inLocation,
          currentId
        );
        node.children.push(itemNode);
      }
    }
  }
  return node;
}

// tree转schema
export function treeNodeToJsonSchema(
  node: any,
  schemaType: string = "schema"
): any {
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
    schema,
    type: nodeType,
    ...rest
  } = node;

  // 获取 type，优先使用节点的 type，如果没有则从 schema 中获取
  const effectiveType = nodeType || schema?.type;

  // 获取 default，优先使用节点的 default，如果没有则从 schema 中获取
  const effectiveDefault =
    nodeDefault !== undefined ? nodeDefault : schema?.default;

  // 格式化 default 值
  function formatDefault(def: any) {
    if (def === "") return "";
    return def;
  }

  const s: any = {
    ...rest,
    type: effectiveType,
  };

  // 1. object 类型
  if (effectiveType === "object") {
    s.properties = {};
    const reqs: string[] = [];
    children?.forEach((c: any) => {
      s.properties[c.name] = treeNodeToJsonSchema(c, schemaType);
      if (c.required) reqs.push(c.name);
    });
    if (reqs.length) s.required = reqs;
    if (effectiveDefault !== undefined) {
      s.default = formatDefault(effectiveDefault);
    }
    return s;
  }

  // 2. array 类型
  if (effectiveType === "array") {
    // apimap_items
    if (schemaType === "apiMap") {
      if (effectiveDefault !== undefined) {
        s.default = Array.isArray(effectiveDefault)
          ? effectiveDefault.map(formatDefault)
          : formatDefault(effectiveDefault);
      }
      if (Array.isArray(children) && children.length > 0) {
        // 转换所有 children 为 items 数组
        const itemsArray: any[] = [];
        children.forEach((child: any) => {
          const itemSchema = treeNodeToJsonSchema(child, schemaType);
          itemsArray.push(itemSchema);
        });
        s.items = itemsArray; // 保持数组格式，包含所有项
      } else {
        // 默认情况：从 schema.items 获取或使用默认值
        s.items = schema?.items || { type: "string" };
      }
      return s;
    } else {
      // items 处理
      if (Array.isArray(children) && children.length > 0) {
        s.items = treeNodeToJsonSchema(children[0]);
      } else {
        s.items = schema?.items || { type: "string" };
      }

      // 默认值处理（必须在 items 处理完后）
      if (effectiveDefault !== undefined) {
        if (Array.isArray(effectiveDefault)) {
          if (s.items && !s.items.oneOf) {
            // 有明确单一子 schema -> 格式化数组元素
            s.default = effectiveDefault.map((d) => formatDefault(d));
          } else {
            // oneOf 或 schema 不明确 -> 原样保留
            s.default = effectiveDefault;
          }
        } else {
          // 单个值强制放到数组里
          s.default = [formatDefault(effectiveDefault)];
        }
      }

      return s;
    }
  }

  // 3. 基本类型（string、number、boolean 等）
  if (effectiveDefault !== undefined) {
    s.default = formatDefault(effectiveDefault);
  }

  // 复制 schema 中的其他属性（除了 type 和 default）
  if (schema) {
    Object.keys(schema).forEach((key) => {
      if (key !== "type" && key !== "default") {
        s[key] = schema[key];
      }
    });
  }
  if (!s?.default || s?.default === "") {
    delete s?.default;
  }
  return s;
}

// tree to schema
export function treeToSchema(node: any) {
  return treeNodeToJsonSchema({
    type: "object",
    id: "root",
    name: "",
    editingName: false,
    required: false,
    in: "query",
    children: node,
  });
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
  return [...formData?.parameters, ...formData?.requestBody];
};

// 更新节点
export const updateNode = (tree: any, id: string, partial: any) => {
  unsavedGuard.setUnsavedChanges(true);
  const walk = (n: any, parentId?: string): any => {
    // 更新当前节点的 ID（如果需要）
    let currentNode = n;
    if (parentId && n.name) {
      const newId = `${parentId}_${n.name}`;
      currentNode = { ...n, id: newId };
    }
    // 检查是否是目标节点
    if (currentNode.id === id) {
      const isTypeChangeToArray = ["array", "object"].includes(partial?.type);
      const updated = { ...currentNode, ...partial };
      if (!isTypeChangeToArray && partial?.type !== undefined) {
        updated.children = [];
      }

      // 如果 name 被更新，也需要更新 id
      if (partial?.name !== undefined && parentId) {
        updated.id = `${parentId}_${partial.name}`;
      }
      return updated;
    }
    // 处理子节点
    if (currentNode.children) {
      return {
        ...currentNode,
        children: currentNode.children.map((child: any) => walk(child, currentNode.id))
      };
    }
    if (currentNode.item) {
      return {
        ...currentNode,
        item: walk(currentNode.item, currentNode.id)
      };
    }
    return currentNode;
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

// 折叠节点
export function getNestedNodeIds(children: any[]): Set<string> {
  const allIds = children.flatMap((node) => {
    const ids: string[] = [];
    const dfs = (currentNode: any) => {
      if (
        (currentNode.type === "object" || currentNode.type === "array") &&
        currentNode.children?.length
      ) {
        ids.push(currentNode.id);
        currentNode.children.forEach(dfs);
      }
    };
    dfs(node);
    return ids;
  });
  return new Set(allIds);
}

// 编辑详情
export function findNodeWithParent(tree: TreeNodeData, targetId: string) {
  const dfs = (
    node: TreeNodeData,
    parent?: TreeNodeData
  ): { node: TreeNodeData; parent?: TreeNodeData } | null => {
    if (node.id === targetId) {
      return {
        node,
        parent: parent
          ? { id: parent.id, name: parent.name, type: parent.type }
          : undefined,
      };
    }
    // 查找子节点
    for (const child of node.children || []) {
      const result = dfs(child, node);
      if (result) return result;
    }
    // 查找 item 节点
    if (node.item) return dfs(node.item, node);
    return null;
  };

  return dfs(tree);
}

export function extractAllDefaults(params: any[], tree: any) {
  const result: Record<string, { default: string }> = {};
  const maxIds: Record<string, number> = {};

  function traverse(items: any[]) {
    items.forEach(item => {
      if (item.id) {
        const match = item.id.match(/^(.+)_item_(\d+)(?:_|$)/);

        if (match) {
          const part1 = match[1];
          const part2 = Number(match[2]);
          if (!maxIds[part1] || part2 > maxIds[part1]) {
            maxIds[part1] = part2;
          }
        }

        if (item.default !== undefined || item?.schema?.default !== undefined) {
          result[item.id] = {
            default: item.default || item?.schema?.default
          };
        }
      }

      if (item.children && Array.isArray(item.children)) {
        traverse(item.children);
      }
    });
  }

  traverse(params);

  // 根据 maxIds 扩展 tree
  function expandChildren(tree: any, maxIds: Record<string, number>) {
    function cloneWithNewId(item: any, newIndex: number, baseKey: string) {
      const newItem = { ...item };
      if (item.id) {
        newItem.id = item.id.replace(
          new RegExp(`^${baseKey}_item_\\d+`),
          `${baseKey}_item_${newIndex}`
        );
      }

      if (item.children && Array.isArray(item.children)) {
        newItem.children = item.children.map((child: any) =>
          cloneWithNewId(child, newIndex, baseKey)
        );
      }
      return newItem;
    }

    Object.keys(maxIds).forEach(key => {
      const max = maxIds[key];
      const node = tree.find((t: any) => t.id === key);
      if (!node || !node.children || node.children.length === 0) return;

      const template = node.children[0];
      const newChildren = [];

      for (let i = 2; i <= max; i++) {
        newChildren.push(cloneWithNewId(template, i, key));
      }

      node.children = [template, ...newChildren];
    });

    return tree;
  }

  const expandedTree = expandChildren(tree, maxIds);

  return { result, tree: expandedTree };
}




// 合并所有schemaData&&formData
export const mergeSchemaWithFormData = (schemaData: any, formData: any) => {
  const results: Record<string, any> = {};
  // 为每个 schemaData 单独处理
  Object.entries(schemaData).forEach(([key, value]) => {
    // 应用当前 schemaData 对应的 formData 更新
    const formDataForKey = formData[key];
    // 为当前 schemaData 创建独立的树
    let currentTree = {
      id: key,
      name: key,
      type: "object",
      required: false,
      in: "query",
      default: key === 'responses' ? formDataForKey?.root_response?.default || '' : "",
      children: Array.isArray(value) ? [...value] : [],
    };
    if (formDataForKey) {
      Object.entries(formDataForKey).forEach(([innerKey, innerValue]) => {
        currentTree = updateNode_(currentTree, innerKey, innerValue);
      });
    }
    if (!currentTree?.default || currentTree?.default === '') {
      delete currentTree.default
    }
    // 保存结果
    results[key] = { ...treeNodeToJsonSchema(currentTree, 'apiMap') };
  });
  return results;
};

export const updateNode_ = (tree: any, id: string, partial: any) => {
  unsavedGuard.setUnsavedChanges(true);
  const walk = (n: any): any => {
    if (n.id === id) {
      const isTypeChangeToArray = ["array", "object"].includes(partial?.type);
      const updated = { ...n, ...partial };
      if (!updated?.default || updated?.default === '') {
        delete updated.default
      }
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
    if (!n?.default || n?.default === '') {
      delete n.default
    }
    return n;
  };
  return walk(tree);
};

export function transformArrayItems(arr: any[]) {
  return arr.map((item: any) => {
    const transformedItem = {
      ...item,
      _id: item.id,
      schema: item.schema ? { ...item.schema } : {}
    };
    if (item.default !== undefined && item.default !== null && item.default !== '') {
      transformedItem.schema.default = item.default;
    }
    delete transformedItem.type
    delete transformedItem.default
    delete transformedItem.id
    return transformedItem;
  });
}