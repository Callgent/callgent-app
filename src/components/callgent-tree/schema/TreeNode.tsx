import React, { useState } from "react";
import type { TreeNodeData, NodeType } from "./type";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownOutlined,
  RightOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import { typeOptions } from "./utils";
import { Button, Popconfirm, Popover, Tag, type TreeNodeProps } from "antd";

const TreeNode: React.FC<TreeNodeProps> = React.memo(
  ({
    node,
    mode,
    onSelect,
    onUpdate,
    onDelete,
    onAdd,
    depth,
    isExpanded,
    hasChildren,
    onToggleExpand,
    onEditNode,
    parentNodeType,
    allNodes,
  }) => {
    /**
     * 处理节点属性变化的函数
     * @param property 变化的属性名
     * @param value 属性的新值
     */
    const handleChange = (
      property: keyof typeof node,
      value: string | boolean | NodeType
    ) => {
      if (mode === 2 || (mode === 3 && property === "defaultValue"))
        onUpdate?.(node.id!, { [property]: value });
    };

    const isNameDisabled =
      (mode === 2 || mode === 3) && parentNodeType === "array";

    const isAddDisabled =
      mode === 2 && parentNodeType === "array" && hasChildren;

    const parentNode = allNodes.find(
      (n: TreeNodeData) => n.id === node.parentId
    );
    let shouldShowAddButton = false;

    if (node.type === "object") {
      shouldShowAddButton = true;
    } else if (
      parentNode &&
      parentNode.type === "array" &&
      (mode === 2 || mode === 3)
    ) {
      // If parent is array and mode is 2 or 3, allow adding siblings (items)
      // but only if the current node itself is not an array.
      if (node.type !== "array") {
        shouldShowAddButton = true;
      }
    }

    // Explicitly ensure array type nodes themselves do not show the add button.
    if (node.type === "array") {
      shouldShowAddButton = false;
    }
    const [typePopoverOpen, setTypePopoverOpen] = useState(false);
    return (
      <div
        className="flex items-center space-x-2 my-1"
        style={{ paddingLeft: `${depth * 10}px` }}
      >
        <div className="w-2">
          {hasChildren && (
            <button onClick={() => onToggleExpand(node.id)}>
              {isExpanded ? <DownOutlined /> : <RightOutlined />}
            </button>
          )}
        </div>
        {mode === 1 && (
          <div
            className="flex flex-1 items-center space-x-2 justify-between cursor-pointer"
            onClick={() => onToggleExpand(node.id)}
          >
            <div className="flex items-center">
              <div className="border-b px-1 py-0.5 text-sm w-full hover:bg-gray-100 hover:border-green-500 text-gray-500 focus:text-black overflow-hidden whitespace-nowrap text-ellipsis focus:border-green-500">
                {isNameDisabled ? "item" : node.name}
              </div>
              <div className="w-5" title="是否必填">
                {node.required ? (
                  <span className="text-red-500 ml-2 cursor-pointer select-none">
                    *
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    className="ml-2"
                  />
                )}
              </div>
            </div>
            <div className="border px-1 py-0.5 text-sm w-[70px] rounded">
              {node.type}
            </div>
          </div>
        )}
        {mode === 2 && (
          <div className="flex flex-1 items-center space-x-2">
            <div className="w-28 flex items-center">
              <input
                className="border-b px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-0 hover:bg-gray-100 hover:border-gr cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis hover:border-green-500"
                value={isNameDisabled ? "item" : node.name}
                title={isNameDisabled ? "item" : node.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={(e) => handleChange("name", e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(node);
                }}
                disabled={isNameDisabled}
              />
              <div className="w-5" title="是否必填">
                {node.required ? (
                  <span
                    className="text-red-500 ml-2 cursor-pointer select-none"
                    onClick={() => handleChange("required", false)}
                  >
                    *
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleChange("required", true)}
                    className="ml-2"
                  />
                )}
              </div>
            </div>
            <div className="flex-1">
              <input
                className="border-b px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-0 hover:bg-gray-100 hover:border-green-500 cursor-pointer text-gray-500 focus:text-black overflow-hidden whitespace-nowrap text-ellipsis focus:border-green-500"
                value={node.defaultValue || ""}
                title={node.defaultValue || ""}
                onChange={(e) => handleChange("defaultValue", e.target.value)}
                onBlur={(e) => handleChange("defaultValue", e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(node);
                }}
                disabled={isNameDisabled}
              />
            </div>
            <div className="min-w-[180px] flex justify-end space-x-2">
              {(["object"].includes(node.type) ||
                (isAddDisabled && node.type !== "array")) && (
                <Button
                  size="small"
                  type="text"
                  icon={<PlusOutlined className="p-1 border rounded" />}
                  onClick={() => onAdd?.(node.id!)}
                />
              )}
              <Popconfirm
                title="确认删除这个节点？"
                onConfirm={() => onDelete?.(node.id!)}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  size="small"
                  type="text"
                  disabled={isAddDisabled}
                  icon={
                    <DeleteOutlined className="text-red-500 p-1 border rounded" />
                  }
                />
              </Popconfirm>
              <Button
                size="small"
                type="text"
                icon={<EditOutlined className="p-1 border rounded" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNode?.(node);
                }}
              />
              <Popover
                open={typePopoverOpen}
                onOpenChange={setTypePopoverOpen}
                content={typeOptions.map((t) => (
                  <div
                    key={t}
                    className="cursor-pointe hover:bg-gray-100 rounded"
                    onClick={() => {
                      handleChange("type", t);
                      setTypePopoverOpen(false);
                    }}
                  >
                    {t}
                  </div>
                ))}
                trigger="click"
              >
                <Tag className="cursor-pointer w-14 text-center">
                  {node.type}
                </Tag>
              </Popover>
            </div>
          </div>
        )}
        {mode === 3 && (
          <div className="flex flex-1 items-center space-x-2 justify-between cursor-pointer ">
            <div className="w-28 flex items-center">
              <div
                title={isNameDisabled ? "item" : node.name}
                onClick={() => onToggleExpand(node.id)}
                className="border-b px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-0 hover:bg-gray-100 hover:border-green-500 cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis focus:border-green-500"
              >
                {isNameDisabled ? "item" : node.name}
              </div>
              <div className="w-5" title="是否必填">
                {node.required ? (
                  <span className="text-red-500 ml-2 cursor-pointer select-none">
                    *
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    className="ml-2"
                  />
                )}
              </div>
            </div>
            <div className="flex-1">
              <input
                className="border-b px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-0 hover:bg-gray-100 hover:border-green-500 cursor-pointer  overflow-hidden whitespace-nowrap text-ellipsis focus:border-green-500"
                value={node.defaultValue || ""}
                title={node.defaultValue || ""}
                onChange={(e) => handleChange("defaultValue", e.target.value)}
                onBlur={(e) => handleChange("defaultValue", e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(node);
                }}
              />
            </div>
            <div className="min-w-[130px] flex justify-end space-x-2">
              {node.type === "array" && (
                <Button
                  size="small"
                  type="text"
                  icon={<PlusOutlined className="p-1 border rounded" />}
                  disabled={isAddDisabled}
                  onClick={() => onAdd?.(node.id!)}
                />
              )}
              {parentNodeType === "array" && node.name === "item" && (
                <Popconfirm
                  title="确认删除这个节点？"
                  onConfirm={() => onDelete?.(node.id!)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button
                    size="small"
                    type="text"
                    icon={
                      <DeleteOutlined className="text-red-500 p-1 border rounded" />
                    }
                  />
                </Popconfirm>
              )}
              <Button
                size="small"
                type="text"
                icon={<ArrowsAltOutlined className="p-1 border rounded" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNode?.(node);
                }}
              />
              <div className="border px-1 py-0.5 text-sm w-[70px] rounded">
                {node.type}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Compare all properties of node
    const nodePropsEqual = prevProps.node === nextProps.node;

    // Compare other props
    const otherPropsEqual =
      prevProps.mode === nextProps.mode &&
      prevProps.depth === nextProps.depth &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.hasChildren === nextProps.hasChildren &&
      prevProps.parentNodeType === nextProps.parentNodeType;

    return nodePropsEqual && otherPropsEqual;
  }
);

export default TreeNode;
