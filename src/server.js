import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

// Read port from .env or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 PapDocAuthX v2 server running on port ${PORT}`);
});
