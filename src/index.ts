import { addCustomElement } from "vuepress-shared";

import { MATHML_TAGS } from "./utils/mathml-tags.js";
import type { PluginFunction, App } from "@vuepress/core";

import type { KatexOptions } from "katex";
import { katex } from "./markdown-it/katex.js";

export interface TexPluginsOptions {
  renderer: "KaTeX" | "MathJax";
  plugins?: string[];
  options?: KatexOptions | any;
}

const TexPlugins =
  (
    options: TexPluginsOptions = {
      renderer: "KaTeX",
    }
  ): PluginFunction =>
  (app: App) => {

    console.log(options);
    return {
      name: "vuepress-plugin-tex",
      define: (): Record<string, unknown> => ({
        TEXPLUGINSOPTIONS: options,
      }),

      extendsBundlerOptions: (config: unknown, app): void => {
        if (options.renderer === "KaTeX" && options?.options?.output !== "html")
          addCustomElement({ app, config }, MATHML_TAGS);
      },

      extendsMarkdown: (md): void => {
        switch (options.renderer) {
          case "MathJax":
            break;
          case "KaTeX":
          default:
            md.use(katex, options);
            break;
        }
      },
    };
  };

export default TexPlugins;
