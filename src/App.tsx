import { Helmet } from "react-helmet-async";

import Logo from "@/assets/images/logo.svg";
import Router from "@/router/index";

import { MotionLazy } from "./components/animate/motion-lazy";
import { AntdAdapter } from "./theme/adapter/antd.adapter";
import { ThemeProvider } from "./theme/theme-provider";
import Toast from "./components/layouts/toast";

function App() {
  return (
    <ThemeProvider adapters={[AntdAdapter]}>
      <MotionLazy>
        <Helmet>
          <title>Callgent</title>
          <link rel="icon" href={Logo} />
        </Helmet>
        <Toast />
        <Router />
      </MotionLazy>
    </ThemeProvider>
  );
}

export default App;
