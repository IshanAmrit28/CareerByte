const mongoose = require("mongoose");
const CodingProblem = require("./models/codingProblem");
require("dotenv").config();

const getProblemId = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const problem = await CodingProblem.findOne({ title: "Two Sum" });
        if (problem) {
            console.log(`PROBLEM_ID=${problem._id}`);
        }
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

getProblemId();
