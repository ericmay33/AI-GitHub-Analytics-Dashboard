import app from "./app";
import { ENV } from "./config/env";

const PORT = ENV.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
