import { useMemo, useState } from "react";
import { CallgentInfo as CallgentInfoType, TreeAction } from "@/types/entity";
import { Add, Delete, Edit, Import, Lock, VirtualApi } from "../icon/icon-tree";
import { useTreeActions, useTreeActionStore } from "@/store/callgentTreeStore";
import { Popconfirm, Tooltip } from "antd";
import { useDeleteCallgent } from "@/store/callgentStore";
import { delCallgentApi, deleteEntry } from "@/api/callgentService";
import { deleteNode } from "@/utils/callgent-tree";
import NodeComponent from "./node-component";
import { createSearchParams } from "@/utils";
import { useEndpointStore } from "@/store/endpoint";
import { useRouter } from "@/router/hooks";
import { unsavedGuard } from "@/router/utils";

interface TreeNodeProps {
  nodes: CallgentInfoType[];
  level: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  callgentId?: string;
  className?: string;
}

const TreeNode = ({
  nodes,
  level = 1,
  expandedNodes,
  onToggle,
  callgentId,
  className,
}: TreeNodeProps) => {
  if (nodes.length === 0) {
    return null;
  }
  const { openModal, setCallgentTree, setCurrentNode } = useTreeActions();
  const { clear, setActiveKey } = useEndpointStore();
  const { closeModal } = useTreeActions();
  const { push } = useRouter();
  const node = nodes[0];
  const iconSrc = useMemo(() => {
    if (node.icon_url) return node.icon_url;
    switch (level) {
      case 1:
        return "/icons/Recruitment.svg";
      case 2:
        return `/icons/${node.id}.svg`;
      case 3:
        return `/icons/${node.adaptorKey}.svg`;
      case 4:
        return "/icons/api.svg";
      default:
        return "/icons/Recruitment.svg";
    }
  }, []);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id!);
  const handleAction = (actionType: TreeAction) => {
    if (unsavedGuard.hasUnsavedChanges()) {
      const shouldProceed =
        window.confirm("确定要离开吗？未保存的更改将会丢失");
      if (shouldProceed) {
        unsavedGuard.setUnsavedChanges(false);
      } else return null;
    }
    switch (actionType) {
      case "add":
      case "import":
        openModal({
          id: node.id!,
          modelTitle: node?.name,
          type: node.id,
          parentType: node?.parentType,
          data: node,
        });
        break;
      case "edit":
        openModal({
          id: node.id!,
          modelTitle: node.adaptorKey || "Callgent",
          type: node.id,
          parentType: node?.parentType,
          data: node,
        });
        break;
      case "lock":
        const params = createSearchParams({
          id: callgentId,
          nodeId: node?.id,
          realmKey: "apiKey:header::api.api.abbb:init",
        });
        push(`/callgent/auth?${params.toString()}`);
        break;
      case "select":
        openModal({
          id: node.id!,
          modelTitle: "Manage Auth",
          type: "select",
          data: node,
        });
        break;
      case "virtualApi":
        push(`/callgent/tree?callgentId=${callgentId}`);
        setCurrentNode(node);
        clear();
        closeModal();
        setActiveKey("1");
        push(`/callgent/tree?callgentId=${callgentId}&entryId=${node?.id}`);
    }
    useTreeActionStore.setState({ action: actionType });
  };
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { callgentTree } = useTreeActionStore();
  const handleCancel = () => {
    setOpenConfirm(false);
  };
  const delCallgent = useDeleteCallgent();

  const deleteCallgent = async () => {
    setConfirmLoading(true);
    try {
      if (level === 1) {
        await delCallgent(node.id!);
        push("/callgent/callgents");
      } else if (level === 4) {
        await delCallgentApi(node.id!);
      } else {
        await deleteEntry(node.id!);
      }
      const newTree = deleteNode(callgentTree, node.id!);
      setCallgentTree(newTree);
    } finally {
      setConfirmLoading(false);
      setOpenConfirm(false);
    }
  };
  const showPopconfirm = () => {
    setOpenConfirm(true);
  };
  return (
    <div className={className}>
      {nodes.map((node) => (
        <div className="w-full" data-testid="tree-node" key={node?.id}>
          <div className="flex justify-between items-center p-2 rounded mb-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700">
            <Tooltip
              title={node.whatFor || node?.summary || node?.description}
              placement="topLeft"
            >
              <div className="flex flex-1 overflow-hidden">
                <button
                  className="w-[95%] text-left bg-transparent cursor-pointer border-none text-base"
                  onClick={() => node.id && onToggle(node.id)}
                  title={node.hint}
                  aria-label={`Toggle ${node.name}`}
                >
                  <span className="flex items-center overflow-hidden flex-1">
                    <div
                      className={`mx-2 ${
                        node?.children !== undefined &&
                        node?.children.length > 0
                          ? "block"
                          : "opacity-0"
                      }`}
                    >
                      {isExpanded ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          fill="currentColor"
                          className="bi bi-chevron-down"
                          viewBox="0 0 16 16"
                        >
                          <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          fill="currentColor"
                          className="bi bi-chevron-right"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                      )}
                    </div>
                    <img
                      title={node?.securities || ""}
                      src={iconSrc}
                      className="mr-2 dark:invert-[75%]"
                      alt={`${node.name} icon`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/icons/default.svg";
                      }}
                    />
                    <NodeComponent
                      node={node}
                      callgentId={callgentId!}
                      level={level}
                    />
                  </span>
                </button>
              </div>
            </Tooltip>
            <div className="node-right flex gap-2 items-center mr-2">
              {node.lock && (
                <div
                  onClick={() => handleAction(level === 1 ? "lock" : "select")}
                >
                  <Lock
                    data={{
                      level,
                      realms: callgentTree[0]?.realms || [],
                      securities: node.securities,
                    }}
                  />
                </div>
              )}
              {node.add && (
                <div
                  onClick={() => handleAction("add")}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Add node"
                >
                  <Add />
                </div>
              )}
              {node.virtualApi && (
                <div
                  onClick={() => handleAction("virtualApi")}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Add node"
                >
                  <VirtualApi />
                </div>
              )}
              {node.import && (
                <div
                  onClick={() => handleAction("import")}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Import data"
                >
                  <Import />
                </div>
              )}
              {node.edit && (
                <div
                  onClick={() => handleAction("edit")}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Edit node"
                >
                  <Edit />
                </div>
              )}
              {node?.delete && (
                <div className="hover:bg-gray-200 dark:hover:bg-gray-500 p-1 rounded">
                  <Popconfirm
                    key="delete"
                    title="Delete the content"
                    description="Are you sure you want to delete this content?"
                    open={openConfirm}
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={handleCancel}
                    onConfirm={deleteCallgent}
                  >
                    <div onClick={showPopconfirm}>
                      <Delete />
                    </div>
                  </Popconfirm>
                </div>
              )}
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div
              className="ml-5 transition-all duration-300"
              role="region"
              aria-live="polite"
            >
              {node.children?.map((child) => (
                <TreeNode
                  key={child.id}
                  nodes={[child]}
                  level={level + 1}
                  expandedNodes={expandedNodes}
                  onToggle={onToggle}
                  callgentId={callgentId}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TreeNode;
