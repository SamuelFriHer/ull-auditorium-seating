import { AppController } from "./controllers/AppController";

const container = document.getElementById("app");
if (container) {
  const app = new AppController(container);
  app.init();
} else {
  console.error("Root container element #app not found.");
}
