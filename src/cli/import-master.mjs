import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../visual/shell/MasterCanvas.tsx";
import { SceneRouter } from "../visual/templates/SceneRouter.tsx";

const Marker = function Marker() {
  return React.createElement("span", { id: "caller-component" }, "caller-component");
};
const scene = {
  id: "S01",
  visualType: "chapter-local",
  payload: { key: "card", data: { label: "demo" } },
  cues: [],
};
const html = renderToStaticMarkup(React.createElement(SceneRouter, {
  scene,
  chapter: { lessonId: "demo", components: { card: Marker } },
}));
if (!html.includes("caller-component")) {
  throw new Error(`chapter-local 没有渲染调用方传入的组件：${html}`);
}
console.log("chapter-local-used");
