// vite.config.ts
import path from "node:path";
import { vanillaExtractPlugin } from "file:///C:/Users/zhaoy/Desktop/callgent/callgent-app/node_modules/.pnpm/@vanilla-extract+vite-plugin@4.0.19_@types+node@20.5.1_babel-plugin-macros@3.1.0_vite@5.4.9_@types+node@20.5.1_/node_modules/@vanilla-extract/vite-plugin/dist/vanilla-extract-vite-plugin.cjs.js";
import react from "file:///C:/Users/zhaoy/Desktop/callgent/callgent-app/node_modules/.pnpm/@vitejs+plugin-react@4.1.0_vite@5.4.9_@types+node@20.5.1_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { visualizer } from "file:///C:/Users/zhaoy/Desktop/callgent/callgent-app/node_modules/.pnpm/rollup-plugin-visualizer@5.9.2/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig, loadEnv } from "file:///C:/Users/zhaoy/Desktop/callgent/callgent-app/node_modules/.pnpm/vite@5.4.9_@types+node@20.5.1/node_modules/vite/dist/node/index.js";
import { createSvgIconsPlugin } from "file:///C:/Users/zhaoy/Desktop/callgent/callgent-app/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.4.9_@types+node@20.5.1_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import tsconfigPaths from "file:///C:/Users/zhaoy/Desktop/callgent/callgent-app/node_modules/.pnpm/vite-tsconfig-paths@5.0.1_typescript@5.2.2_vite@5.4.9_@types+node@20.5.1_/node_modules/vite-tsconfig-paths/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_APP_BASE_PATH || "/";
  const isProduction = mode === "production";
  return {
    base,
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy", "classProperties"]
          }
        }
      }),
      vanillaExtractPlugin({
        identifiers: ({ debugId }) => `${debugId}`
      }),
      tsconfigPaths(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]"
      }),
      isProduction && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap"
      })
    ].filter(Boolean),
    server: {
      open: true,
      host: true,
      port: Number(env.VITE_PORT) || 5173
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
            "vendor-charts": ["apexcharts", "react-apexcharts"]
          }
        }
      }
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router", "antd", "@ant-design/icons", "axios", "dayjs"],
      exclude: ["@iconify/react"]
    },
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
      legalComments: "none",
      target: "esnext"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx6aGFveVxcXFxEZXNrdG9wXFxcXGNhbGxnZW50XFxcXGNhbGxnZW50LWFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcemhhb3lcXFxcRGVza3RvcFxcXFxjYWxsZ2VudFxcXFxjYWxsZ2VudC1hcHBcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3poYW95L0Rlc2t0b3AvY2FsbGdlbnQvY2FsbGdlbnQtYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xyXG5cclxuaW1wb3J0IHsgdmFuaWxsYUV4dHJhY3RQbHVnaW4gfSBmcm9tIFwiQHZhbmlsbGEtZXh0cmFjdC92aXRlLXBsdWdpblwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xyXG5cclxuLy8gLi4uIGV4aXN0aW5nIGltcG9ydHMgLi4uXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcblx0Y29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcclxuXHRjb25zdCBiYXNlID0gZW52LlZJVEVfQVBQX0JBU0VfUEFUSCB8fCBcIi9cIjtcclxuXHRjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGJhc2UsXHJcblx0XHRwbHVnaW5zOiBbXHJcblx0XHRcdHJlYWN0KHtcclxuXHRcdFx0XHRiYWJlbDoge1xyXG5cdFx0XHRcdFx0cGFyc2VyT3B0czoge1xyXG5cdFx0XHRcdFx0XHRwbHVnaW5zOiBbXCJkZWNvcmF0b3JzLWxlZ2FjeVwiLCBcImNsYXNzUHJvcGVydGllc1wiXSxcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSksXHJcblx0XHRcdHZhbmlsbGFFeHRyYWN0UGx1Z2luKHtcclxuXHRcdFx0XHRpZGVudGlmaWVyczogKHsgZGVidWdJZCB9KSA9PiBgJHtkZWJ1Z0lkfWAsXHJcblx0XHRcdH0pLFxyXG5cdFx0XHR0c2NvbmZpZ1BhdGhzKCksXHJcblx0XHRcdGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcclxuXHRcdFx0XHRpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBcInNyYy9hc3NldHMvaWNvbnNcIildLFxyXG5cdFx0XHRcdHN5bWJvbElkOiBcImljb24tW2Rpcl0tW25hbWVdXCIsXHJcblx0XHRcdH0pLFxyXG5cdFx0XHRpc1Byb2R1Y3Rpb24gJiZcclxuXHRcdFx0dmlzdWFsaXplcih7XHJcblx0XHRcdFx0b3BlbjogdHJ1ZSxcclxuXHRcdFx0XHRnemlwU2l6ZTogdHJ1ZSxcclxuXHRcdFx0XHRicm90bGlTaXplOiB0cnVlLFxyXG5cdFx0XHRcdHRlbXBsYXRlOiBcInRyZWVtYXBcIixcclxuXHRcdFx0fSksXHJcblx0XHRdLmZpbHRlcihCb29sZWFuKSxcclxuXHJcblx0XHRzZXJ2ZXI6IHtcclxuXHRcdFx0b3BlbjogdHJ1ZSxcclxuXHRcdFx0aG9zdDogdHJ1ZSxcclxuXHRcdFx0cG9ydDogTnVtYmVyKGVudi5WSVRFX1BPUlQpIHx8IDUxNzNcclxuXHRcdH0sXHJcblxyXG5cdFx0YnVpbGQ6IHtcclxuXHRcdFx0dGFyZ2V0OiBcImVzbmV4dFwiLFxyXG5cdFx0XHRtaW5pZnk6IFwiZXNidWlsZFwiLFxyXG5cdFx0XHRzb3VyY2VtYXA6ICFpc1Byb2R1Y3Rpb24sXHJcblx0XHRcdGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuXHRcdFx0Y2h1bmtTaXplV2FybmluZ0xpbWl0OiAxNTAwLFxyXG5cdFx0XHRyb2xsdXBPcHRpb25zOiB7XHJcblx0XHRcdFx0b3V0cHV0OiB7XHJcblx0XHRcdFx0XHRtYW51YWxDaHVua3M6IHtcclxuXHRcdFx0XHRcdFx0XCJ2ZW5kb3ItY29yZVwiOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0LXJvdXRlclwiXSxcclxuXHRcdFx0XHRcdFx0XCJ2ZW5kb3ItdWlcIjogW1wiYW50ZFwiLCBcIkBhbnQtZGVzaWduL2ljb25zXCIsIFwiQGFudC1kZXNpZ24vY3NzaW5qc1wiLCBcImZyYW1lci1tb3Rpb25cIiwgXCJzdHlsZWQtY29tcG9uZW50c1wiXSxcclxuXHRcdFx0XHRcdFx0XCJ2ZW5kb3ItdXRpbHNcIjogW1wiYXhpb3NcIiwgXCJkYXlqc1wiLCBcImkxOG5leHRcIiwgXCJ6dXN0YW5kXCIsIFwiQGljb25pZnkvcmVhY3RcIl0sXHJcblx0XHRcdFx0XHRcdFwidmVuZG9yLWNoYXJ0c1wiOiBbXCJhcGV4Y2hhcnRzXCIsIFwicmVhY3QtYXBleGNoYXJ0c1wiXSxcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblxyXG5cdFx0b3B0aW1pemVEZXBzOiB7XHJcblx0XHRcdGluY2x1ZGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyXCIsIFwiYW50ZFwiLCBcIkBhbnQtZGVzaWduL2ljb25zXCIsIFwiYXhpb3NcIiwgXCJkYXlqc1wiXSxcclxuXHRcdFx0ZXhjbHVkZTogW1wiQGljb25pZnkvcmVhY3RcIl0sXHJcblx0XHR9LFxyXG5cclxuXHRcdGVzYnVpbGQ6IHtcclxuXHRcdFx0ZHJvcDogaXNQcm9kdWN0aW9uID8gW1wiY29uc29sZVwiLCBcImRlYnVnZ2VyXCJdIDogW10sXHJcblx0XHRcdGxlZ2FsQ29tbWVudHM6IFwibm9uZVwiLFxyXG5cdFx0XHR0YXJnZXQ6IFwiZXNuZXh0XCIsXHJcblx0XHR9LFxyXG5cdH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtVLE9BQU8sVUFBVTtBQUVuVixTQUFTLDRCQUE0QjtBQUNyQyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxjQUFjLGVBQWU7QUFDdEMsU0FBUyw0QkFBNEI7QUFDckMsT0FBTyxtQkFBbUI7QUFJMUIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDekMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sT0FBTyxJQUFJLHNCQUFzQjtBQUN2QyxRQUFNLGVBQWUsU0FBUztBQUU5QixTQUFPO0FBQUEsSUFDTjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1IsTUFBTTtBQUFBLFFBQ0wsT0FBTztBQUFBLFVBQ04sWUFBWTtBQUFBLFlBQ1gsU0FBUyxDQUFDLHFCQUFxQixpQkFBaUI7QUFBQSxVQUNqRDtBQUFBLFFBQ0Q7QUFBQSxNQUNELENBQUM7QUFBQSxNQUNELHFCQUFxQjtBQUFBLFFBQ3BCLGFBQWEsQ0FBQyxFQUFFLFFBQVEsTUFBTSxHQUFHLE9BQU87QUFBQSxNQUN6QyxDQUFDO0FBQUEsTUFDRCxjQUFjO0FBQUEsTUFDZCxxQkFBcUI7QUFBQSxRQUNwQixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQUEsUUFDMUQsVUFBVTtBQUFBLE1BQ1gsQ0FBQztBQUFBLE1BQ0QsZ0JBQ0EsV0FBVztBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0YsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUVoQixRQUFRO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNLE9BQU8sSUFBSSxTQUFTLEtBQUs7QUFBQSxJQUNoQztBQUFBLElBRUEsT0FBTztBQUFBLE1BQ04sUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLE1BQ1IsV0FBVyxDQUFDO0FBQUEsTUFDWixjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxNQUN2QixlQUFlO0FBQUEsUUFDZCxRQUFRO0FBQUEsVUFDUCxjQUFjO0FBQUEsWUFDYixlQUFlLENBQUMsU0FBUyxhQUFhLGNBQWM7QUFBQSxZQUNwRCxhQUFhLENBQUMsUUFBUSxxQkFBcUIsdUJBQXVCLGlCQUFpQixtQkFBbUI7QUFBQSxZQUN0RyxnQkFBZ0IsQ0FBQyxTQUFTLFNBQVMsV0FBVyxXQUFXLGdCQUFnQjtBQUFBLFlBQ3pFLGlCQUFpQixDQUFDLGNBQWMsa0JBQWtCO0FBQUEsVUFDbkQ7QUFBQSxRQUNEO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxJQUVBLGNBQWM7QUFBQSxNQUNiLFNBQVMsQ0FBQyxTQUFTLGFBQWEsZ0JBQWdCLFFBQVEscUJBQXFCLFNBQVMsT0FBTztBQUFBLE1BQzdGLFNBQVMsQ0FBQyxnQkFBZ0I7QUFBQSxJQUMzQjtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1IsTUFBTSxlQUFlLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLE1BQ2hELGVBQWU7QUFBQSxNQUNmLFFBQVE7QUFBQSxJQUNUO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
