require("dotenv").config();
const axios = require("axios");

async function test() {
    try {
        console.log("Testing Base64 encoded code...");
        const code = Buffer.from("print(123)").toString("base64");
        
        const response = await axios.post(process.env.JUDGE0_URL + "/submissions/batch?base64_encoded=true&wait=true", {
            submissions: [
                {
                    source_code: code,
                    language_id: 71,
                    cpu_time_limit: 2,
                    memory_limit: 256000
                }
            ]
        }, {
            timeout: 10000 
        });
        
        console.log("Response data:", JSON.stringify(response.data).substring(0, 100));
    } catch(err) {
        if (err.response) {
            console.error("HTTP Error:", err.response.status, err.response.data);
        } else {
            console.error("Network Error:", err.message);
        }
    }
}
test();
