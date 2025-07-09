import { CallgentInfo } from "#/entity";
import { Link } from "react-router";
import { useTreeActionStore } from '@/models/callgentTreeStore';
import { getCallgentApi } from "@/api/services/callgentService";
import { useEndpointStore } from "@/models/endpoint";
import { extractFirst2xxJsonSchema, generateId, jsonSchemaToTreeNode } from "./endpoint/util";

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
  const { setFormData, formData, setParameters, setResponses, setEndpointName, setEditId } = useEndpointStore()

  const toEditApi = async (node: any) => {
    const { data } = await getCallgentApi(node.id);
    setEditId(node.id)
    const requestBody = data?.params?.requestBody?.content["application/json"]?.schema
    const parameters = data?.params.parameters.map((item: any) => ({ ...(item?.schema || {}), ...item, editingName: false, id: generateId() }))
    if (requestBody) {
      setParameters([...parameters, ...(jsonSchemaToTreeNode(requestBody).children as [])])
    } else (
      setParameters(parameters)
    )
    const responsesSchema = extractFirst2xxJsonSchema(data?.responses)
    const responses = responsesSchema?.properties ? (jsonSchemaToTreeNode(responsesSchema).children || []) : []
    setResponses(responses)
    setFormData({
      ...formData,
      parameters: parameters,
      requestBody: data?.params?.requestBody,
      responses: responses,
      endpoint: {
        method: data?.method || 'POST'
      }
    })
    setEndpointName(data?.path || null)
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