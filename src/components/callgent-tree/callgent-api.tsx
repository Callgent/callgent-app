import { useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github_dark";
import { toast } from "sonner";
import { Button } from "antd";
import { restoreDataFromOpenApi } from "@/utils/callgent-tree";
import { putCallgentApi } from "@/api/services/callgentService";

export default function SwaggerEditor({ openApi }: { openApi: any }) {
  const [spec, setSpec] = useState(JSON.stringify(openApi, null, 2));
  const [parsedSpec, setParsedSpec] = useState(openApi);
  const [error, setError] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleEditorChange = (value: any) => {
    setSpec(value);
    setError(null);
  };

  const handleRun = async () => {
    setRunLoading(true);
    try {
      const parsed = JSON.parse(spec);
      setParsedSpec(parsed);
      setError(null);
    } catch (e) {
      setError(e.message);
      toast.error(e.message, {
        position: "top-center",
      });
    } finally {
      setRunLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      let dataToSave = parsedSpec;
      if (spec !== JSON.stringify(parsedSpec, null, 2)) {
        dataToSave = JSON.parse(spec);
      }
      const restoreData = restoreDataFromOpenApi(dataToSave);
      const queryParams = new URLSearchParams(location.search);
      const id = queryParams.get("endpointsId");
      await putCallgentApi(id!, restoreData);
      setParsedSpec(dataToSave)
      toast.success("OpenAPI spec saved successfully!");
    } catch (e) {
      toast.error(`Error saving OpenAPI spec: ${e.message}`, {
        position: "top-center",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row w-full" style={{ height: "calc(100vh - 6px)" }}>
      <div className="w-full md:w-1/2 flex flex-col min-h-0">
        <div className="flex-1 relative min-h-0">
          <AceEditor
            mode="json"
            theme="github_dark"
            value={spec}
            onChange={handleEditorChange}
            name="swagger-editor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="100%"
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false,
              showPrintMargin: false,
            }}
          />
          <div className="absolute top-2 right-2 flex space-x-2 z-10">
            <Button
              type="primary"
              loading={runLoading}
              onClick={handleRun}
              style={{ background: "#89BF04", borderColor: "#89BF04" }}
            >
              Run
            </Button>
            <Button
              type="primary"
              loading={saveLoading}
              onClick={handleSave}
              style={{ background: "#89BF04", borderColor: "#89BF04" }}
            >
              Save
            </Button>
          </div>
        </div>
        {error && (
          <div className="p-2 text-red-500 text-sm bg-red-100">
            Error: {error}
          </div>
        )}
      </div>
      <div className="w-full md:w-1/2 h-full overflow-auto min-h-0">
        <SwaggerUI spec={parsedSpec} docExpansion="full" />
      </div>
    </div>
  );
}