import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import TreeNode from "./TreeNode";
import type { TreeNodeData, EditableTreeProps } from "./type";
import { produce } from "immer";
import { Modal, Form, Input, Select, Checkbox, Button } from "antd";
import { findNodeById, typeOptions } from "./utils";

const { Option } = Select;

const EditableTree: React.FC<EditableTreeProps> = ({
  data,
  mode = 1,
  onSelect,
  onChange,
  onDelete,
  onAdd,
  className,
  defaultExpandAll,
  onEditNode: onEditNodeProp,
  treeType,
}) => {
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<number>>(() => {
    if (defaultExpandAll) {
      return new Set(data.map((node) => node.id));
    }
    return new Set();
  });

  // 当 data 或 defaultExpandAll 变化时，更新 expandedNodeIds
  useEffect(() => {
    if (defaultExpandAll) {
      setExpandedNodeIds(new Set(data.map((node) => node.id)));
    } else {
      // Preserve expanded state for existing nodes
      setExpandedNodeIds((prev) => {
        const newSet = new Set<number>();
        data.forEach((node) => {
          if (prev.has(node.id)) {
            newSet.add(node.id);
          }
        });
        return newSet;
      });
    }
  }, [data, defaultExpandAll]);
  const dataRef = useRef(data);
  const onDeleteRef = useRef(onDelete);
  const onAddRef = useRef(onAdd);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<TreeNodeData | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // 当 data 变化时，维持现有节点的展开状态（忽略 defaultExpandAll 后续影响）
  useEffect(() => {
    // Preserve expanded state for existing nodes
    setExpandedNodeIds((prev) => {
      const newSet = new Set<number>();
      data.forEach((node) => {
        if (prev.has(node.id)) {
          newSet.add(node.id);
        }
      });
      return newSet;
    });
  }, [data]);

  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  useEffect(() => {
    onAddRef.current = onAdd;
  }, [onAdd]);

  /**
   * 切换节点的展开/折叠状态
   * @param nodeId 节点ID
   */
  const toggleExpand = useCallback((nodeId: number) => {
    setExpandedNodeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  /**
   * 更新节点数据
   * @param id 节点ID
   * @param partial 节点部分数据
   */
  const updateNode = useCallback(
    (id: number, partial: Partial<TreeNodeData>) => {
      const newData = produce(dataRef.current, (draft) => {
        const nodeToUpdate = findNodeById(draft as TreeNodeData[], id);
        if (nodeToUpdate) {
          const oldType = nodeToUpdate.type;
          Object.assign(nodeToUpdate, partial); // Update the node's properties first

          if (partial.type && partial.type !== oldType) {
            const nodesToRemove = new Set<number>();

            // Function to recursively find all descendants of a given node ID
            const collectDescendants = (currentNodeId: number) => {
              draft.forEach((node) => {
                if (node.parentId === currentNodeId) {
                  nodesToRemove.add(node.id);
                  collectDescendants(node.id);
                }
              });
            };

            // Collect all descendants of the *updated* node (i.e., its children and their children)
            collectDescendants(nodeToUpdate.id);

            // Filter out the collected nodes from the draft
            for (let i = draft.length - 1; i >= 0; i--) {
              if (nodesToRemove.has(draft[i].id)) {
                draft.splice(i, 1);
              }
            }

            // If the new type is 'array', add a default 'item' child
            if (partial.type === "array") {
              const newNode: TreeNodeData = {
                id: Date.now() + Math.random(),
                _id: `${nodeToUpdate.name}_item`, // Added _id
                name: "item",
                type: "string",
                parentId: nodeToUpdate.id,
                depth: nodeToUpdate.depth + 1,
              };
              draft.push(newNode);
            }
          }
        }
      });
      onChange?.(newData);
    },
    [onChange, findNodeById]
  );

  /**
   * 删除节点及其所有子节点
   * @param id 待删除节点的ID
   */
  const deleteNode = useCallback(
    (id: number) => {
      const newData = produce(dataRef.current, (draft) => {
        const nodesToDelete = new Set<number>();
        const findDescendants = (nodeId: number) => {
          nodesToDelete.add(nodeId);
          draft.forEach((node) => {
            if (node.parentId === nodeId) {
              findDescendants(node.id);
            }
          });
        };
        findDescendants(id);
        return draft.filter((node) => !nodesToDelete.has(node.id));
      });
      onChange?.(newData);
      onDeleteRef.current?.(id);
    },
    [onChange]
  );

  /**
   * 添加新节点
   * @param parentId 父节点的ID
   */
  const addNode = useCallback(
    (parentId: number) => {
      const parentNode = findNodeById(dataRef.current, parentId);
      const newDepth = parentNode ? parentNode.depth + 1 : 0;
      let newNode: TreeNodeData | undefined = undefined;
      let nodesToProcess: TreeNodeData[] = [];
      if (parentNode && parentNode.type === "array") {
        if (mode === 2) {
          newNode = {
            id: Date.now() + Math.random(),
            _id: parentNode ? `${parentNode._id}_New Node` : "New Node",
            name: "New Node",
            type: "string",
            parentId: parentNode ? parentNode.id : 0,
            depth: parentNode ? parentNode.depth + 1 : 0,
          };
          nodesToProcess.push(newNode);
        } else if (mode === 3) {
          newNode = {
            id: Date.now() + Math.random(),
            _id: `${parentNode._id}_item`, // Corrected _id
            name: "item",
            type: "object", // mode 3 下类型不可编辑，但需要支持添加子节点
            parentId: parentNode.id,
            depth: parentNode.depth + 1,
            // 确保没有 defaultValue
          };

          // 查找第一个名为 "item" 的子节点作为模板
          const item1 = dataRef.current.find(
            (node) => node.parentId === parentId && node.name === "item"
          );

          nodesToProcess.push(newNode);

          if (item1) {
            // 递归复制子节点
            const copyChildren = (
              sourceNodeId: number,
              newParentId: number,
              newDepth: number
            ) => {
              dataRef.current.forEach((child) => {
                if (child.parentId === sourceNodeId) {
                  const newChild: TreeNodeData = {
                    ...child,
                    id: Date.now() + Math.random() + Math.random(), // 确保ID唯一
                    _id: `${newNode?._id}_${child.name}`, // Added _id
                    parentId: newParentId,
                    depth: newDepth,
                    defaultValue: undefined, // 确保没有 defaultValue
                  };
                  nodesToProcess.push(newChild);
                  copyChildren(child.id, newChild.id, newDepth + 1);
                }
              });
            };
            copyChildren(item1.id, newNode.id, newDepth + 1);
          }
        }
      } else if (treeType === "parameters") {
        newNode = {
          id: Date.now() + Math.random(),
          _id: parentNode ? `${parentNode._id}_New Parameter` : "New Parameter",
          name: "New Parameter", // 更明确的名称
          type: "string", // 默认类型改为 string
          parentId: parentNode ? parentNode.id : 0,
          depth: parentNode ? parentNode.depth + 1 : 0,
        };
        nodesToProcess.push(newNode);
      } else {
        newNode = {
          id: Date.now() + Math.random(),
          _id: parentNode ? `${parentNode._id}_item` : "item",
          name: "item",
          type: "string",
          parentId: parentNode ? parentNode.id : 0,
          depth: parentNode ? parentNode.depth + 1 : 0,
        };
        nodesToProcess.push(newNode);
      }

      if (nodesToProcess.length > 0) {
        const newData = produce(dataRef.current, (draft) => {
          draft.push(...nodesToProcess);
        });
        onChange?.(newData);
        if (newNode) {
          onAddRef.current?.(parentId, newNode);
        }
        if (parentId !== 0) {
          setExpandedNodeIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(parentId);
            return newSet;
          });
        }
      }
    },
    [onChange, findNodeById, mode, treeType, setExpandedNodeIds, dataRef]
  );

  /**
   * 处理节点编辑，打开编辑弹窗
   * @param node 待编辑的节点数据
   */
  const handleEditNode = useCallback(
    (node: TreeNodeData) => {
      const nodeWithDefaults: TreeNodeData = {
        ...node,
        description: node.description,
        defaultValue: node.defaultValue,
        required: node.required || false,
        enum: node.enum || [],
        properties: node.properties || [],
        items: node.items || undefined,
      };
      setEditingNode(nodeWithDefaults);
      setIsModalVisible(true);
      form.setFieldsValue(nodeWithDefaults);
      onEditNodeProp?.(node);
    },
    [form, onEditNodeProp]
  );

  /**
   * 处理弹窗确认，保存节点编辑
   */
  const handleModalOk = useCallback(() => {
    form.validateFields().then((values) => {
      if (editingNode) {
        updateNode(editingNode.id, values);
        setIsModalVisible(false);
        setEditingNode(null);
      }
    });
  }, [form, editingNode, updateNode]);

  /**
   * 处理弹窗取消
   */
  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setEditingNode(null);
  }, []);

  /**
   * 渲染树节点
   */
  const renderTreeNodes = useMemo(() => {
    const nodesToRender: TreeNodeData[] = [];
    const queue: TreeNodeData[] = data
      .filter((node) => node.parentId === 0)
      .sort((a, b) => a.id - b.id);

    while (queue.length > 0) {
      const currentNode = queue.shift();
      if (currentNode) {
        nodesToRender.push(currentNode);
        if (expandedNodeIds.has(currentNode.id)) {
          let children = data
            .filter((node) => node.parentId === currentNode.id)
            .sort((a, b) => a.id - b.id);
          // 根据mode过滤数组节点的子节点数量
          if (currentNode.type === "array" && mode === 2) {
            children = children.slice(0, 1); // 仅保留第一个子节点
          }
          queue.unshift(...children);
        }
      }
    }

    return nodesToRender.map((node) => {
      const parentNode =
        node.parentId !== 0 ? findNodeById(data, node.parentId!) : undefined;
      const parentNodeType = parentNode?.type;
      return (
        <TreeNode
          key={node.id}
          node={node}
          mode={mode}
          onSelect={onSelect}
          onUpdate={updateNode}
          onDelete={deleteNode}
          onAdd={addNode}
          depth={node.depth}
          isExpanded={expandedNodeIds.has(node.id)}
          hasChildren={data.some((child) => child.parentId === node.id)}
          onToggleExpand={toggleExpand}
          onEditNode={handleEditNode}
          parentNodeType={parentNodeType}
          treeType={treeType}
          allNodes={data}
        />
      );
    });
  }, [
    data,
    mode,
    onSelect,
    updateNode,
    deleteNode,
    addNode,
    expandedNodeIds,
    toggleExpand,
    handleEditNode,
    findNodeById,
  ]);

  return (
    <div className={`editable-tree ${className || ""}`}>
      {renderTreeNodes}
      {mode === 2 && (
        <Button
          size="small"
          className="w-full text-center py-2 border border-dashed border-gray-400 rounded-md text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
          onClick={() => addNode(0)}
        >
          + Add
        </Button>
      )}
      {isModalVisible && (
        <Modal
          title="Edit Node Detail"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          forceRender
        >
          <Form
            form={form}
            layout="vertical"
            name={`node_detail_form_${treeType}`}
          >
            {mode !== 3 && (
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  { required: true, message: "Please input the node name!" },
                ]}
              >
                <Input disabled={mode === 1} />
              </Form.Item>
            )}
            {mode !== 3 && (
              <Form.Item
                name="type"
                label="Type"
                rules={[
                  { required: true, message: "Please select the node type!" },
                ]}
              >
                <Select disabled={mode === 1}>
                  {typeOptions.map((t) => (
                    <Option value={t} key={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {treeType === "parameters" && mode !== 3 && (
              <Form.Item
                name="in"
                label="Parameter Location"
                rules={[
                  {
                    required: true,
                    message: "Please select parameter location!",
                  },
                ]}
              >
                <Select disabled={mode === 1}>
                  <Option value="query">query</Option>
                  <Option value="header">header</Option>
                  <Option value="path">path</Option>
                  <Option value="cookie">cookie</Option>
                </Select>
              </Form.Item>
            )}
            {mode !== 3 && (
              <Form.Item name="description" label="Description">
                <Input.TextArea disabled={mode === 1} />
              </Form.Item>
            )}
            {mode === 3 ? (
              <Form.Item name="defaultValue" label="Default Value">
                <Input.TextArea rows={10} />
              </Form.Item>
            ) : (
              <Form.Item name="defaultValue" label="Default Value">
                <Input.TextArea disabled={mode === 1} />
              </Form.Item>
            )}
            {mode !== 3 && (
              <Form.Item name="required" valuePropName="checked">
                <Checkbox disabled={mode === 1}>Required</Checkbox>
              </Form.Item>
            )}
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default EditableTree;
