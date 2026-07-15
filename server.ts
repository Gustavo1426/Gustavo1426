/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createApp } from "./server/app.js";
import { setupVite } from "./server/config/vite.js";

async function startServer() {
  const app = createApp();
  const PORT = 3000;

  // Integrate Vite dev server or serve production assets
  await setupVite(app);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
