import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <>
      <h1>How to start?</h1>
      <div className="card my-24">
        <h2>Local environnement</h2>
        <p>You can use one of the following:</p>
        <ul style={{ textAlign: "left" }}>
          <li>
            <code>springboard</code>
          </li>
          <li>
            <code>ode-dev-server</code>
          </li>
        </ul>
        <p style={{ textAlign: "left" }}>
          This is required to allow Vite proxy to connect your React App to
          <code> localhost:8090</code>
        </p>
      </div>
      <div className="card my-24">
        <h2>Remote environnement</h2>
        <ul style={{ textAlign: "left" }}>
          <li>
            <code>cp env.template .env.local</code>
          </li>
          <li>Fill in the blank!</li>
        </ul>
        <p style={{ textAlign: "left" }}>
          Vite uses <code>VITE_RECETTE</code> to connect
        </p>
      </div>
    </>
  </StrictMode>,
);
