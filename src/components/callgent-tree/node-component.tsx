import { CallgentInfo } from "#/entity";
import { Link } from "react-router";
import { useTreeActionStore } from '@/models/callgentTreeStore';
import { useEndpointStore } from "@/models/endpoint";
import { Modal } from "antd";

export default function NodeComponent({ node, callgentId, level }: { node: CallgentInfo, callgentId: string, level: number }) {
  let content = (
    <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1">
      {node?.name}
    </span>
  )
  const docsUrl = import.meta.env.VITE_DOCS_URL;
  switch (node?.type) {
    case 'CLIENT':
      if (node?.adaptorKey === 'Webpage') {
        content = (
          <Link
            to={`${docsUrl}/chatbox?callgentId=${callgentId}&entryId=${node.id}`}
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600"
            data-testid="webpage-link"
          >
            {node?.name}
          </Link>
        );
      } else {
        content = (
          <Link
            to={`/chatbox?callgentId=${callgentId}&entryId=${node.id}`}
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600"
            data-testid="webpage-link"
          >
            {node?.name}
          </Link>
        );
      }
      break
    case 'SERVER':
    case 'EVENT':
  }
  const { toggletheEP, editId } = useEndpointStore()
  // 编辑切换 ep
  const toEditApi = async (node: any) => {
    if (editId) {
      Modal.confirm({
        title: '确认取消修改？',
        content: '所有未保存的更改将会丢失，是否确定取消？',
        okText: '确认',
        cancelText: '返回',
        centered: true,
        okButtonProps: {
          className: 'bg-primary text-white border-none'
        },
        async onOk() {
          await toggletheEP(node.id)
          useTreeActionStore.setState({ action: 'virtualApi' })
          useTreeActionStore.setState({ currentNode: { ...node, type: node?.parentType } })
        }
      });
    } else {
      await toggletheEP(node.id)
      useTreeActionStore.setState({ action: 'virtualApi' })
      useTreeActionStore.setState({ currentNode: { ...node, type: node?.parentType } })
    }
  }
  if (level === 4) {
    content = (
      <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600 text-info" onClick={() => toEditApi(node)}>
        {node?.name}
      </div >
    );
  }
  return content;
}