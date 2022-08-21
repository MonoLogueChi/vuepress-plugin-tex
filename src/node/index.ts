import { path } from "@vuepress/utils";
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
        bundlerOptions: ViteBundlerOptions | WebpackBundlerOptions | unknown,
        app: App
      ): void => {
        // 修改 @vuepress/bundler-vite 的配置项
        if (app.options.bundler.name === "@vuepress/bundler-vite") {
          const viteBundlerOptions = bundlerOptions as ViteBundlerOptions;
          viteBundlerOptions.vuePluginOptions ??= {};
          viteBundlerOptions.vuePluginOptions.template ??= {};
          viteBundlerOptions.vuePluginOptions.template.compilerOptions ??= {};
          const isCustomElement =
            viteBundlerOptions.vuePluginOptions.template.compilerOptions
              .isCustomElement;
          viteBundlerOptions.vuePluginOptions.template.compilerOptions.isCustomElement =
            (tag) => {
              return (
                isCustomElement?.(tag) ||
                MATHML_TAGS.includes(tag) ||
                tag.startsWith("mjx-")
              );
            };
        }

        // 修改 @vuepress/bundler-webpack 的配置项
        if (app.options.bundler.name === "@vuepress/bundler-webpack") {
          const webpackBundlerOptions = bundlerOptions as WebpackBundlerOptions;
          webpackBundlerOptions.vue ??= {};
          webpackBundlerOptions.vue.compilerOptions ??= {};
          const isCustomElement =
            webpackBundlerOptions.vue.compilerOptions.isCustomElement;
          webpackBundlerOptions.vue.compilerOptions.isCustomElement = (tag) => {
            return (
              isCustomElement?.(tag) ||
              MATHML_TAGS.includes(tag) ||
              tag.startsWith("mjx-")
            );
          };
        }
      },

      // 注册 markdown-it 插件
      extendsMarkdown: (md: MarkdownIt): void => {
        switch (options.renderer.toLowerCase()) {
          case "mathjax":
            md.use(mathjax, options);
            break;
          case "katex":
          default:
            md.use(katex, options);
            break;
        }
      },

      clientConfigFile: path.resolve(
        __dirname,
        "../client/clientConfigFile.js"
      ),
    };
  };

export default TexPlugins;
