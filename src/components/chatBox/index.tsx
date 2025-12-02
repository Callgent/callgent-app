import useChatBoxStore from "@/store/chatBox";
import Markdown from "../layouts/markdown";

export default function Chat(): JSX.Element {
  const { chatBox } = useChatBoxStore();
  return (
    <div className="text-black dark:text-black space-y-4">
      {chatBox.map((item, index) => (
        <div
          key={index}
          className={`flex ${
            item.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {item.role === "user" ? (
            <div className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <Markdown>{item?.message}</Markdown>
            </div>
          ) : (
            <div className="w-full">
              <div className="px-3 py-2 rounded-lg">
                <Markdown>{item?.message}</Markdown>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
