import { vitePluginFakeServer } from "vite-plugin-fake-server";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const base = env.VITE_APP_BASE_PATH || "/";
	const { VITE_API_URL } = env
	const isProduction = mode === "production";

	return {
		base,
		plugins: [
			react({
				babel: {
					parserOpts: {
						plugins: ["decorators-legacy", "classProperties"],
					},
				},
			}),
			// mock
			vitePluginFakeServer({
				include: "src/_mock",
				logger: false,
				infixName: false,
				enableProd: true,
			}),
			vanillaExtractPlugin({
				identifiers: ({ debugId }) => `${debugId}`,
			}),
			tsconfigPaths(),
			createSvgIconsPlugin({
				iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
				symbolId: "icon-[dir]-[name]",
			}),
			isProduction &&
			visualizer({
				open: true,
				gzipSize: true,
				brotliSize: true,
				template: "treemap",
			}),
		].filter(Boolean),

		server: {
			host: true,
			port: Number(env.VITE_PORT) || 5173,
			proxy: {
				"/api": {
					target: VITE_API_URL,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, "/api"),
				},
			}
		},

		build: {
			target: "esnext",
			minify: "esbuild",
			sourcemap: !isProduction,
			cssCodeSplit: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					manualChunks: {
						"vendor-core": ["react", "react-dom", "react-router"],
						"vendor-ui": ["antd", "@ant-design/icons", "@ant-design/cssinjs", "framer-motion", "styled-components"],
						"vendor-utils": ["axios", "dayjs", "i18next", "zustand", "@iconify/react"],
						"vendor-charts": ["apexcharts", "react-apexcharts"],
					},
				},
			},
		},

		optimizeDeps: {
			include: ["react", "react-dom", "react-router", "antd", "@ant-design/icons", "axios", "dayjs"],
			exclude: ["@iconify/react"],
		},

		esbuild: {
			drop: isProduction ? ["console", "debugger"] : [],
			legalComments: "none",
			target: "esnext",
		},
	};
});
