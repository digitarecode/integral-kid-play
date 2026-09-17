import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registrarServiceWorker } from "./lib/registerServiceWorker";

createRoot(document.getElementById("root")!).render(<App />);

void registrarServiceWorker();
