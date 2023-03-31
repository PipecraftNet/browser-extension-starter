import * as esbuild from "esbuild"

const ctx = await esbuild.context({
  entryPoints: ["src/contents/index.ts"],
  bundle: true,
  define: {
    "process.env.PLASMO_TARGET": '"userscript"',
    "process.env.PLASMO_TAG": '"dev"',
  },
  alias: {
    "data-text:./style.scss": "src/contents/style.scss",
    "browser-extension-storage": "browser-extension-storage/userscript",
  },
  loader: {
    ".scss": "text",
  },
  target: ["chrome58", "firefox57", "safari11", "edge16"],
  outfile: "build/userscript-dev/index.js",
})

await ctx.watch()
console.log("watching...")

const { host, port } = await ctx.serve({
  servedir: "build/userscript-dev",
})
console.log(`Server is running at http://${host}:${port}/`)
console.log("Hit CTRL-C to stop the server")

// Append this code to output for live reload
// new EventSource("http://localhost:8000/esbuild").addEventListener("change", () => location.reload())

console.log(`\nAdd this code to Tampermonkey

// ==UserScript==
// @name         localhost:${port}
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author
// @match        https://*/*
// @match        http://*/*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_addValueChangeListener
// @grant GM_removeValueChangeListener

// ==/UserScript==

(function () {
  "use strict";
  if (!document.body) {
    return;
  }

  document.GM_getValue = GM_getValue;
  document.GM_setValue = GM_setValue;
  document.GM_deleteValue = GM_deleteValue;
  document.GM_listValues = GM_listValues;
  document.GM_addValueChangeListener = GM_addValueChangeListener;
  document.GM_removeValueChangeListener = GM_removeValueChangeListener;

  const script = document.createElement("script");
  script.src = "http://localhost:${port}/index.js";
  document.body.append(script);

  new EventSource("http://localhost:${port}/esbuild").addEventListener(
    "change",
    () => {
      location.reload();
    }
  );
})();
// END


`)
