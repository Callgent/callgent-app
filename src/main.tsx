import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

// svg icons
import "virtual:svg-icons-register";
import "./locales/i18n";
import "./global.css";
import "./theme/theme.css";

// root component
import App from "./App";
import ProgressBar from "./components/progress-bar";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
	<HelmetProvider>
		<Suspense>
			<ProgressBar />
			<Analytics debug={false} />
			<App />
		</Suspense>
	</HelmetProvider>,
);
