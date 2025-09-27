import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // 引用根组件 App
import "./style.css"; // 引用我们的全局样式

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
