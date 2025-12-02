import { CallgentInfo } from "@/types/entity";
import { useLocation } from "react-router";
import { useRouter } from "@/router/hooks";

export default function NodeComponent({
  node,
  callgentId,
  level,
}: {
  node: CallgentInfo;
  callgentId: string;
  level: number;
}) {
  let content = (
    <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1">
      {node?.name}
    </span>
  );
  const docsUrl = import.meta.env.VITE_DOCS_URL;
  const { push } = useRouter();
  switch (node?.type) {
    case "CLIENT":
      if (node?.adaptorKey === "Webpage") {
        content = (
          <span
            onClick={() => {
              push(
                `${docsUrl}/chatbox?callgentId=${callgentId}&entryId=${node.id}`
              );
            }}
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600"
            data-testid="webpage-link"
          >
            {node?.name}
          </span>
        );
      } else {
        content = (
          <span
            onClick={() => {
              push(`/chatbox?callgentId=${callgentId}&entryId=${node.id}`);
            }}
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600"
            data-testid="webpage-link"
          >
            {node?.name}
          </span>
        );
      }
      break;
    case "SERVER":
    case "EVENT":
  }
  // 编辑切换 ep
  const location = useLocation();
  const toEditApi = async (node: any) => {
    const params = new URLSearchParams(location.search);
    params.set("apiId", node.id);
    params.set("type", node?.parentType);
    push(`${location.pathname}?${params.toString()}`);
  };
  if (level === 4) {
    content = (
      <div
        className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600 text-info"
        onClick={() => toEditApi(node)}
      >
        {node?.name}
      </div>
    );
  }
  return content;
}
