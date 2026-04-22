import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("SMARTERP: Initializing Main Entry...");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("CRITICAL: Root element #root not found in DOM!");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log("SMARTERP: Render triggered successfully.");
} catch (error) {
  console.error("SMARTERP FATAL MOUNT ERROR:", error);
  // Fail-safe visual indicator
  document.body.style.border = "10px solid red";
  const div = document.createElement('div');
  div.style.cssText = "position:fixed;top:0;left:0;width:100%;background:red;color:white;padding:20px;z-index:9999;font-family:monospace";
  div.innerHTML = "<h1>Render Crash</h1><pre>" + error.toString() + "</pre>";
  document.body.appendChild(div);
}
