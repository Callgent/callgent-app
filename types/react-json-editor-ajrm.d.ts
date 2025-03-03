declare module "react-json-editor-ajrm" {
  import { ComponentType } from "react";

  interface JSONInputProps {
    placeholder?: any;
    locale?: any;
    height?: string;
    width?: string;
    onChange?: (e: { jsObject: any; error: false | string }) => void;
    colors?: {
      default?: string;
      background?: string;
      string?: string;
      number?: string;
      colon?: string;
      keys?: string;
      error?: string;
    };
    style?: {
      body?: React.CSSProperties;
      [key: string]: React.CSSProperties | undefined;
    };
  }

  const JSONInput: ComponentType<JSONInputProps>;
  export default JSONInput;
}

declare module "react-json-editor-ajrm/locale/en" {
  const locale: any;
  export default locale;
}