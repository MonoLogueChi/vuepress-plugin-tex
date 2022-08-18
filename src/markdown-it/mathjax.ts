/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Waylon Flinn
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import juice from "juice";
import { mathjax as MathJax } from "mathjax-full/js/mathjax";
import { TeX } from "mathjax-full/js/input/tex";
import { SVG } from "mathjax-full/js/output/svg";
import { CHTML } from "mathjax-full/js/output/chtml";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages";
import { tex } from "./tex";

import type { PluginWithOptions } from "markdown-it";
import type { MathJaxOptions } from "../utils/mathjax";
import type { TexPluginsOptions } from "../index";

interface DocumentOptions {
  InputJax: TeX<unknown, unknown, unknown>;
  OutputJax: SVG<unknown, unknown, unknown> | CHTML<unknown, unknown, unknown>;
}

const renderMath = (
  content: string,
  documentOptions: DocumentOptions,
  displayMode: boolean
): string => {
  const adaptor = liteAdaptor();

  RegisterHTMLHandler(adaptor);
  const mathDocument = MathJax.document(content, documentOptions);
  /* eslint-disable */
  const html = adaptor.outerHTML(
    mathDocument.convert(content, { display: displayMode })
  );
  const stylesheet = adaptor.outerHTML(
    documentOptions.OutputJax.styleSheet(mathDocument) as any
  );

  /* eslint-enable */
  return juice(html + stylesheet);
};

export const mathjax: PluginWithOptions<TexPluginsOptions> = (md, op) => {
  const options = (op?.options || {}) as MathJaxOptions;
  const documentOptions = {
    InputJax: new TeX({
      packages: AllPackages,
      ...options?.tex,
    }),
    // OutputJax: new SVG({
    //   fontCache: "none",
    //   ...options?.svg,
    // }),
    OutputJax: new CHTML({
      // ...options?.chtml,
    }),
  };

  md.use(tex, {
    render: (content, displayMode) =>
      renderMath(content, documentOptions, displayMode),
  });
};
