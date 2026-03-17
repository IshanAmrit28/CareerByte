const mongoose = require("mongoose");
const CodingProblem = require("./backend/models/codingProblem");
const User = require("./backend/models/user");
require("dotenv").config({ path: "./backend/.env" });

const seedProblem = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");

        // Find an admin or recruiter user to be the creator
        const user = await User.findOne({ userType: { $in: ["admin", "recruiter"] } });
        if (!user) {
            console.error("No admin or recruiter user found to assign as creator.");
            process.exit(1);
        }

        const problemData = {
            title: "Two Sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Example 1:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```",
            difficulty: "Easy",
            timeLimit: 2,
            memoryLimit: 256,
            testCases: [
                {
                    input: "4\n2 7 11 15\n9",
                    expectedOutput: "0 1",
                    isHidden: false
                },
                {
                    input: "3\n3 2 4\n6",
                    expectedOutput: "1 2",
                    isHidden: false
                },
                {
                    input: "2\n3 3\n6",
                    expectedOutput: "0 1",
                    isHidden: true
                }
            ],
            created_by: user._id
        };

        const existing = await CodingProblem.findOne({ title: "Two Sum" });
        if (existing) {
            await CodingProblem.findByIdAndUpdate(existing._id, problemData);
            console.log("Updated existing problem: Two Sum");
        } else {
            await CodingProblem.create(problemData);
            console.log("Created new problem: Two Sum");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding problem:", error.message);
        process.exit(1);
    }
};

seedProblem();
