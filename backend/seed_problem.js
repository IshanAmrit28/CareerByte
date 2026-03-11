const mongoose = require("mongoose");
const CodingProblem = require("./models/codingProblem");
const User = require("./models/user");
require("dotenv").config();

const seedProblem = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");

        // Find an admin or recruiter user to be the creator
        const user = await User.findOne({ userType: { $in: ["admin", "recruiter", "Admin", "Recruiter"] } });
        if (!user) {
            console.error("No admin or recruiter user found to assign as creator.");
            process.exit(1);
        }

        const problemData = {
            title: "Two Sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Input Format:**\n1. The first line contains an integer `n` (size of the array).\n2. The second line contains `n` space-separated integers.\n3. The third line contains an integer `target`.\n\n**Output Format:**\nSpace-separated indices of the two numbers.\n\n**Example 1:**\n```\nInput: \n4\n2 7 11 15\n9\nOutput: 0 1\n```",
            difficulty: "Easy",
            timeLimit: 2,
            memoryLimit: 256,
            templates: {
                cpp: "#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvoid solve() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    int target;\n    cin >> target;\n    \n    unordered_map<int, int> seen;\n    for(int i=0; i<n; i++) {\n        int complement = target - nums[i];\n        if(seen.count(complement)) {\n            cout << seen[complement] << \" \" << i << endl;\n            return;\n        }\n        seen[nums[i]] = i;\n    }\n}\n\nint main() {\n    solve();\n    return 0;\n}",
                java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        \n        Map<Integer, Integer> map = new HashMap<>();\n        for(int i=0; i<n; i++) {\n            int complement = target - nums[i];\n            if(map.containsKey(complement)) {\n                System.out.println(map.get(complement) + \" \" + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}",
                python: "import sys\n\ndef solve():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n = int(input_data[0])\n    nums = list(map(int, input_data[1:n+1]))\n    target = int(input_data[n+1])\n    \n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            print(f\"{seen[complement]} {i}\")\n            return\n        seen[num] = i\n\nif __name__ == \"__main__\":\n    solve()"
            },
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
