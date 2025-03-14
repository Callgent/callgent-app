import { useMemo, useState } from 'react';
import { CallgentInfo as CallgentInfoType, TreeAction } from '#/entity';
import { Add, Delete, Edit, Import, Lock, VirtualApi } from './icon';
import { useTreeActions, useTreeActionStore } from '@/store/callgentTreeStore';
import { Popconfirm, Tooltip } from 'antd';
import { useDeleteCallgent } from '@/store/callgentStore';
import { deleteEntry } from '@/api/services/callgentService';
import { deleteNode } from '@/utils/callgent-tree';
import NodeComponent from './node-component';
import { useNavigate } from 'react-router';
import { createSearchParams } from '@/utils';

interface TreeNodeProps {
  nodes: CallgentInfoType[];
  level: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  callgentId?: string;
}

const TreeNode = ({ nodes, level = 1, expandedNodes, onToggle, callgentId }: TreeNodeProps) => {
  if (nodes.length === 0) {
    return null
  }
  const { openModal, setCallgentTree, setCurrentNode } = useTreeActions();
  const node = nodes[0]
  const navigate = useNavigate();
  const iconSrc = useMemo(() => {
    if (node.icon_url) return node.icon_url;
    switch (level) {
      case 1: return '/icons/Recruitment.svg';
      case 2: return `/icons/${node.id}.svg`;
      case 3: return `/icons/${node.adaptorKey}.svg`;
      case 4: return '/icons/api.svg';
      default: return '/icons/Recruitment.svg';
    }
  }, []);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id!);
  const handleAction = (actionType: TreeAction) => {
    switch (actionType) {
      case 'add':
      case 'import':
        openModal({
          id: node.id!,
          modelTitle: node?.name,
          type: node.id,
          data: node,
        });
        break;
      case 'edit':
        openModal({
          id: node.id!,
          modelTitle: node.adaptorKey || "Callgent",
          type: node.id,
          data: node,
        });
        break;
      case 'lock':
        const params = createSearchParams({
          id: callgentId,
          nodeId: node?.id,
          realmKey: "apiKey:header::api.api.abbb:init",
        });
        navigate(`/callgent/auth?${params.toString()}`)
        break;
      case 'select':
        openModal({
          id: node.id!,
          modelTitle: "Manage Auth",
          type: 'select',
          data: node,
        });
        break;
      case 'virtualApi':
        setCurrentNode(node);
        navigate(`/callgentapi?callgentId=${callgentId}&entryId=${node?.id}`)
    }
    useTreeActionStore.setState({ action: actionType });
  }
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
      } else {
        await deleteEntry(node.id!)
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
    <div>
      {nodes.map(node => (
        <div className="w-full" data-testid="tree-node" key={node?.id}>
          <div className="flex justify-between items-center p-2 rounded mb-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700">
            <Tooltip title={node.summary} placement="topLeft">
              <div className="flex flex-1 overflow-hidden">
                <button
                  className="w-[95%] text-left bg-transparent cursor-pointer border-none text-base"
                  onClick={() => node.id && onToggle(node.id)}
                  title={node.hint}
                  aria-label={`Toggle ${node.name}`}
                >
                  <span className="flex items-center overflow-hidden flex-1">
                    <img
                      title={node?.securities ? '' : '1sss23'}
                      src={iconSrc}
                      className="mr-2 dark:invert-[75%] h-5 w-5"
                      alt={`${node.name} icon`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/default.svg';
                      }}
                    />
                    <NodeComponent node={node} callgentId={callgentId!} level={level} />
                  </span>
                </button>
              </div>
            </Tooltip>
            <div className="node-right flex gap-2 items-center">
              {node.lock && (
                <div onClick={() => handleAction(level === 1 ? 'lock' : 'select')}>
                  <Lock
                    data={{
                      level,
                      realms: callgentTree[0]?.realms || [],
                      securities: node.securities
                    }}
                  />
                </div>
              )}
              {node.add && (
                <div
                  onClick={() => handleAction('add')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Add node"
                >
                  <Add />
                </div>
              )}
              {node.virtualApi && (
                <div
                  onClick={() => handleAction('virtualApi')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Add node"
                >
                  <VirtualApi />
                </div>
              )}
              {node.import && node.type === "SERVER" && (
                <div
                  onClick={() => handleAction('import')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Import data"
                >
                  <Import />
                </div>
              )}
              {node.edit && (
                <div
                  onClick={() => handleAction('edit')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                  role="button"
                  aria-label="Edit node"
                >
                  <Edit />
                </div>
              )}
              {node?.delete &&
                <div className='hover:bg-gray-200 dark:hover:bg-gray-500 p-1 rounded'>
                  <Popconfirm
                    key="delete"
                    title={level === 1 ? 'Delete the callgent' : 'Delete the entry'}
                    description="Are you sure you want to delete this content?"
                    open={openConfirm}
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={handleCancel}
                    onConfirm={deleteCallgent}
                  >
                    <div onClick={showPopconfirm} ><Delete /></div>
                  </Popconfirm>
                </div>
              }
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div className="ml-5 transition-all duration-300" role="region" aria-live="polite">
              {node.children?.map(child => (
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