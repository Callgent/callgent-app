import { postRequestApi } from '@/api/services/callgentService';
import useChatBoxStore from '@/store/chatBox';
import { getSearchParamsAsJson } from '@/utils';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

const InputField: React.FC = () => {
    const { actions } = useChatBoxStore();
    const { addMessage } = actions;
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const navigate = useNavigate();
    const params = getSearchParamsAsJson();

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        const files: File[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }
        setFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const handleSendMessage = async () => {
        if (isLoading || input.trim() === '') return;
        setIsLoading(true);
        addMessage({ role: 'user', message: input });
        if (!params.callgentId) {
            navigate('/callgent/callgents', { replace: true });
            setIsLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append('requirement', input);
        files.forEach((file) => {
            formData.append('files', file);
        });
        try {
            const { message } = await postRequestApi(params.callgentId, formData);
            addMessage({ role: 'bot', message: message });
        } finally {
            setIsLoading(false);
            setInput('');
            setFiles([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col w-full bg-[#F4F4F4] dark:bg-[#2F2F2F] rounded-xl p-3">
            <div className="w-full">
                <textarea
                    ref={textareaRef}
                    placeholder="Describe the UI you'd like to generate."
                    className="resize-none w-full border-none border-transparent bg-transparent focus:outline-none focus:ring-0 bg-[#F4F4F4] dark:bg-[#2F2F2F]"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    disabled={isLoading}
                />
            </div>
            {files.length > 0 && (
                <div className="mt-2 flex">
                    <ul className="flex space-x-2">
                        {files.map((file, index) => (
                            <li key={index} className="text-sm text-gray-600">
                                {file.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="w-full flex justify-end">
                <svg
                    className={`mr-[-1px] cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
                    onClick={handleSendMessage}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                >
                    <path
                        fillRule="evenodd"
                        d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"
                    />
                </svg>
            </div>
        </div>
    );
};

export default InputField;
