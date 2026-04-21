import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ScheduleMaker from "./main.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ScheduleMaker />
  </StrictMode>
);
