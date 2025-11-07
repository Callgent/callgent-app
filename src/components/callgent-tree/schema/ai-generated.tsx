import React, { useState } from "react";
import { Button, Modal, Input } from "antd";
import { Wand } from "lucide-react";
import { useEndpointStore } from "@/models/endpoint";
import apiClient from "@/api/apiClient";

interface TreePageProps {
  onDataReceived: (data: any) => void;
}

const AIGenerated: React.FC<TreePageProps> = ({ onDataReceived }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { information, setInformation } = useEndpointStore();
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // const response = await apiClient.post({
      //   url: "/api/rest/invoke/eFy4ndGK-rA5M3ZUmPQyF/eFy4SrBIgSt2u9l7i_lav/generate-openapi",
      //   data: { requirement: information?.whatFor },
      // });
      const response = {
        parameters: [
          {
            name: "Authorization",
            in: "header",
            description:
              "Bearer token for authentication, FIXME: this is for test, use realm in production",
            required: true,
            schema: {
              type: "string",
            },
            example: "Bearer <OPENROUTER_API_KEY>",
          },
          {
            name: "HTTP-Referer",
            in: "header",
            description: "Optional. Site URL for rankings on openrouter.ai",
            required: false,
            schema: {
              type: "string",
            },
            example: "<YOUR_SITE_URL>",
          },
          {
            name: "X-Title",
            in: "header",
            description: "Optional. Site title for rankings on openrouter.ai",
            required: false,
            schema: {
              type: "string",
            },
            example: "<YOUR_SITE_NAME>",
          },
        ],
        requestBody: {
          type: "object",
          properties: {
            messages: {
              type: "array",
              description: "List of message objects",
              items: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    description:
                      "The role of the message sender (e.g., 'system', 'user', 'assistant')",
                  },
                  content: {
                    type: "string",
                    format: "textarea",
                    description: "The content of the message",
                  },
                },
                required: ["role", "content"],
              },
            },
            logit_bias: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description: "The content of the message",
                },
                format: {
                  type: "number",
                  description: "",
                },
              },
              description: "Mapping of token IDs to bias values",
            },
          },
        },
        responses: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the completion",
            },
            choices: {
              type: "array",
              description: "List of completion choices",
              items: {
                type: "object",
                properties: {
                  message: {
                    type: "object",
                    properties: {
                      role: {
                        type: "string",
                        description: "The role of the message sender",
                      },
                      content: {
                        type: "string",
                        description: "The content of the message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      onDataReceived(response);
    } finally {
      setLoading(false);
      handleCancel();
    }
  };

  return (
    <div>
      <Wand size={16} onClick={showModal} className="cursor-pointer" />
      <Modal
        title="AI 生成"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleGenerate}
            disabled={!information?.whatFor?.trim()}
          >
            生成
          </Button>,
        ]}
      >
        <Input.TextArea
          rows={4}
          value={information?.whatFor}
          onChange={(e) => setInformation({ whatFor: e.target.value })}
          placeholder="请输入您的需求描述..."
          className="mb-4"
        />
      </Modal>
    </div>
  );
};

export default AIGenerated;
