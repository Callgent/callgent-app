import { CallgentInfo } from "#/entity";
import { Link } from "react-router";

export default function NodeComponent({ node, callgentId, level }: { node: CallgentInfo, callgentId: string, level: number }) {
  let content;
  const docsUrl = import.meta.env.VITE_DOCS_URL;

  switch (node.adaptorKey) {
    case 'Webpage':
      content = (
        <Link
          to={`${docsUrl}/chatbox?callgentId=${callgentId}&entryId=${node.id}`}
          className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600"
          data-testid="webpage-link"
        >
          {node.name}
        </Link>
      );
      break;
    default:
      if (level === 4) {
        content = (
          <Link
            to={`/callgentapi?endpointsId=${node.id}`}
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 hover:text-blue-600"
            data-testid="webpage-link"
          >
            {node.name}
          </Link>
        );
      } else {
        content = (
          <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1">
            {node.name}
          </span>
        );
      }
      break;
  }

  return content;
}