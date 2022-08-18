import { addCustomElement } from "vuepress-shared";
import { MATHML_TAGS } from "./utils/mathml-tags";
import { katex } from "./markdown-it/katex";
import { mathjax } from "./markdown-it/mathjax";

import type { PluginFunction, App } from "@vuepress/core";
import type { ViteBundlerOptions } from "vuepress";
import type { WebpackBundlerOptions } from "vuepress-webpack";
import type { KatexOptions } from "katex";
import type MarkdownIt from "markdown-it";

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
    return {
      name: "vuepress-plugin-tex",
      define: (): Record<string, unknown> => ({
        TEXPLUGINSOPTIONS: options,
      }),

      // 自定义标签
      extendsBundlerOptions: (
        config: ViteBundlerOptions | WebpackBundlerOptions | unknown,
        app
      ): void => {
        if (options.renderer === "KaTeX" && options?.options?.output !== "html")
          addCustomElement({ app, config }, MATHML_TAGS);
        else if (
          options.renderer === "MathJax" &&
          options?.options?.output !== "svg"
        ) {
          // 修改 @vuepress/bundler-vite 的配置项
          if (app.options.bundler.name === "@vuepress/bundler-vite") {
            const bundlerOptions = config as ViteBundlerOptions;
            bundlerOptions.vuePluginOptions ??= {};
            bundlerOptions.vuePluginOptions.template ??= {};
            bundlerOptions.vuePluginOptions.template.compilerOptions ??= {};
            const isCustomElement =
              bundlerOptions.vuePluginOptions.template.compilerOptions
                .isCustomElement;
            bundlerOptions.vuePluginOptions.template.compilerOptions.isCustomElement =
              (tag) => {
                if (isCustomElement?.(tag)) return true;
                if (tag.startsWith("mjx-")) return true;
              };
          }

          // 修改 @vuepress/bundler-webpack 的配置项
          if (app.options.bundler.name === "@vuepress/bundler-webpack") {
            const bundlerOptions = config as WebpackBundlerOptions;
            bundlerOptions.vue ??= {};
            bundlerOptions.vue.compilerOptions ??= {};
            const isCustomElement =
              bundlerOptions.vue.compilerOptions.isCustomElement;
            bundlerOptions.vue.compilerOptions.isCustomElement = (tag) => {
              if (isCustomElement?.(tag)) return true;
              if (tag.startsWith("mjx-")) return true;
            };
          }
        }
      },

      extendsMarkdown: (md: MarkdownIt): void => {
        switch (options.renderer) {
          case "MathJax":
            md.use(mathjax, options);
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
