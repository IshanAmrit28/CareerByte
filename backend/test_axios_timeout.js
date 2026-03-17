require("dotenv").config();
const axios = require("axios");

async function test() {
    try {
        console.log("Sending request to:", process.env.JUDGE0_URL + "/submissions/batch");
        const response = await axios.post(process.env.JUDGE0_URL + "/submissions/batch?base64_encoded=false&wait=true", {
            submissions: [
                {
                    source_code: "print(123)",
                    language_id: 71
                }
            ]
        }, {
            timeout: 5000,
            headers: {
                "Content-Type": "application/json",
                "Connection": "keep-alive"
            }
        });
        console.log("Response data:", response.data);
    } catch(err) {
        if (err.response) {
            console.error("HTTP Error:", err.response.status, err.response.data);
        } else {
            console.error("Network Error:", err.message);
        }
    }
}
test();
