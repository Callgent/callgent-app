import { CallgentInfo } from "#/entity";
import { Link, useLocation, useNavigate } from "react-router";
import { useTreeActionStore } from '@/models/callgentTreeStore';
import { getCallgentApi } from "@/api/services/callgentService";
import { useEndpointStore } from "@/models/endpoint";

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
  const { setFormData, formData } = useEndpointStore()
  const toEditApi = async (node: any) => {
    const { data } = await getCallgentApi(node.id);
    setFormData({
      ...formData,
      parameters: data?.params?.parameters,
      requestBody: data?.params?.requestBody,
      responses: data?.responses[200].content["application/json"].schema
    })
    setFormData({
      ...formData,
      parameters: data?.params?.parameters,
      requestBody: data?.params?.requestBody,
      responses: data?.responses[200].content["application/json"].schema
    })
    setTimeout(() => {
      useTreeActionStore.setState({ action: 'virtualApi' })
      useTreeActionStore.setState({ currentNode: node })
    }, 0);
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