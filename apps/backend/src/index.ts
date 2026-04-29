import { env } from "./config/env.js";
import { createApp } from "./app/createApp.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`SkillBridge backend running on http://localhost:${env.port}`);
});
