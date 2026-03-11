require("dotenv").config();
const JUDGE0_URL = process.env.JUDGE0_URL;
console.log("JUDGE0_URL:", JUDGE0_URL);
console.log("Batch POST URL:", `${JUDGE0_URL}/submissions/batch?base64_encoded=true`);
