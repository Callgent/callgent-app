import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router';
import { CallgentInfo as CallgentInfoType } from '#/entity';
import TreeNode from './node';
import { TreeActionModal } from './model';
import useTreeActionStore, { useFetchAdaptor, useFetchCallgentTree, useTreeActions } from '@/models/callgentTreeStore';
import { enhanceNode, setAdaptor } from '@/utils/callgent-tree';
import { CircleLoading } from '../layouts/loading';
import Endpoint from './endpoint';
import { useEndpointStore } from '@/models/endpoint';
import { useRouter } from '@/router/hooks';

export default function CallgentInfo() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useRouter()
  const location = useLocation();

  const { callgentTree, action } = useTreeActionStore();
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
        const enhancedData = enhanceNode(tree, 1, 'root');
        setCallgentTree([enhancedData]);
        setExpandedNodes(new Set(getAllIds(tree)));
      }
      const featchAdaptor = await fetchAdaptor();
      const adaptor = setAdaptor(featchAdaptor);
      setCallgentAdaptor(adaptor);
    } catch (error) {
      console.error("Failed to load data:", error);
      push("/callgent/callgents", { replace: false });
    } finally {
      setIsLoading(false);
    }
  }, [getAllIds, push]);
  const { toggletheEP } = useEndpointStore()
  const getApi = async (apiId: string, apiType: string) => {
    const { data }: any = await toggletheEP(apiId)
    useTreeActionStore.setState({ action: 'virtualApi' })
    useTreeActionStore.setState({ currentNode: { ...data, type: apiType } })
  }
  const queryParams = new URLSearchParams(location.search);
  useEffect(() => {
    const id = queryParams.get('callgentId');
    if (id) {
      loadData(id);
    } else {
      push("/callgent/callgents", { replace: false });
    }
  }, [loadData]);
  useEffect(() => {
    const apiId = queryParams.get('apiId');
    const apiType = queryParams.get('type');
    if (apiId && apiType) {
      getApi(apiId, apiType)
    }
  }, [location])
  if (isLoading) {
    return <CircleLoading />;
  }

  return (
    <div className="w-full flex flex-col-reverse justify-between lg:flex-row">
      {action === 'virtualApi' && <Endpoint />}
      <TreeNode
        className='flex-1 rounded-md py-2 bg-[#F6F7F8] dark:bg-[#323234] mb-4 lg:mb-0'
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