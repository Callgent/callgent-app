import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CallgentInfo as CallgentInfoType } from '#/entity';
import TreeNode from './node';
import { TreeActionModal } from './model';
import useTreeActionStore, { useFetchAdaptor, useFetchCallgentTree, useTreeActions } from '@/models/callgentTreeStore';
import { enhanceNode, setAdaptor } from '@/utils/callgent-tree';
import { CircleLoading } from '../loading';

export default function CallgentInfo() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const { callgentTree } = useTreeActionStore();
  const fetchCallgentTree = useFetchCallgentTree();
  const fetchAdaptor = useFetchAdaptor();

  const getAllIds = useCallback((node: CallgentInfoType): string[] => {
    if (!node.id) return [];
    const shouldExpand = !node?.type || node?.type !== 'SERVER';
    const childIds = (shouldExpand && node.children) ? node.children.flatMap(getAllIds) : [];
    const currendId = shouldExpand ? node.id : ''
    return [currendId, ...childIds];
  }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const { setCallgentTree, setCallgentAdaptor } = useTreeActions();
  const loadData = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const tree = await fetchCallgentTree(id);
      if (tree) {
        const enhancedData = enhanceNode(tree, 1);
        setCallgentTree([enhancedData]);
        setExpandedNodes(new Set(getAllIds(tree)));
      }
      const featchAdaptor = await fetchAdaptor();
      const adaptor = setAdaptor(featchAdaptor);
      setCallgentAdaptor(adaptor);
    } catch (error) {
      console.error("Failed to load data:", error);
      navigate("/callgent/callgents", { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [getAllIds, navigate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('callgentId');
    if (id) {
      loadData(id);
    } else {
      navigate("/callgent/callgents", { replace: true });
    }
  }, [location.search, loadData]);

  if (isLoading) {
    return <CircleLoading />;
  }

  return (
    <div className="w-full rounded-md py-2 bg-[#F6F7F8] dark:bg-[#323234]">
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