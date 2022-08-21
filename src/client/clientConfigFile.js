import { defineClientConfig } from "@vuepress/client";
// import type { TexPluginsOptions } from "../node/index";

// TODO 动态引入
// import "./style/katex.css";

// declare const TEXPLUGINSOPTIONS: TexPluginsOptions;

export default defineClientConfig({
  setup() {
    switch (TEXPLUGINSOPTIONS.renderer.toLowerCase()) {
      case "mathjax":
        break;
      case "katex":
      default:
        import("./style/katex.css");
        break;
    }
  },
});
