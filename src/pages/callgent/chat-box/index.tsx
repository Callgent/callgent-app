import Chat from "@/components/chatBox";
import InputField from "@/components/chatBox/Input";
import { Layout } from "antd";

export default function ChatBox() {
  return (
    <Layout className="px-20 pt-10 pb-2 h-screen overflow-auto">
      <div className="h-full overflow-auto py-2">
        <Chat />
      </div>
      <InputField />
    </Layout>
  );
}
