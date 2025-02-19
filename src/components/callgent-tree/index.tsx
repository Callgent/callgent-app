import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CallgentInfo as CallgentInfoType } from '#/entity';
import TreeNode from './node';
import { TreeActionModal } from './model';
import { useCallgentTree, useFetchAdaptor, useFetchCallgentTree, useTreeActions } from '@/store/callgentTreeStore';
import { enhanceNode, setAdaptor } from '@/utils/callgent-tree';

export default function CallgentInfo() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const callgentTree = useCallgentTree();
  const fetchCallgentTree = useFetchCallgentTree();
  const fetchAdaptor = useFetchAdaptor();

  const getAllIds = useCallback((node: CallgentInfoType): string[] => [
    node.id!,
    ...(node.children?.flatMap(getAllIds) || [])
  ], []);

  const handleToggle = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const { setCallgentTree, setCallgentAdaptor } = useTreeActions();
  const loadData = useCallback(async (id: string) => {
    const tree = await fetchCallgentTree(id);
    if (tree) {
      const enhancedData = enhanceNode(tree, 1);
      setCallgentTree([enhancedData])
      setExpandedNodes(new Set(getAllIds(tree)));
    }
    const featchAdaptor = await fetchAdaptor();
    const adaptor = setAdaptor(featchAdaptor);
    setCallgentAdaptor(adaptor);
  }, [getAllIds, navigate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('callgentId');
    if (id) {
      loadData(id);
    } else {
      navigate("/callgent/callgents", { replace: true });
    }
  }, [location.search]);

  return (
    <div className="w-full rounded-md py-2 px-4 bg-[#F6F7F8] dark:bg-[#323234]">
      <TreeNode
        nodes={callgentTree}
        level={1}
        expandedNodes={expandedNodes}
        onToggle={handleToggle}
        callgentId={callgentTree[0]?.id}
      />
      <TreeActionModal />
    </div>
  );
}