const fs = require('fs');

const files = [
    './src/pages/UserDashboard.jsx',
    './src/pages/Interview.jsx'
];

const replacements = [
    [/bg-\[\#020817\]/g, "bg-gray-50 dark:bg-[#020817]"],
    [/text-white/g, "text-gray-900 dark:text-white"],
    [/text-gray-400/g, "text-gray-600 dark:text-gray-400"],
    [/text-gray-300/g, "text-gray-700 dark:text-gray-300"],
    [/text-gray-100/g, "text-gray-900 dark:text-gray-100"],
    [/text-gray-200/g, "text-gray-800 dark:text-gray-200"],
    [/border-gray-800/g, "border-gray-200 dark:border-gray-800"],
    [/border-gray-700/g, "border-gray-300 dark:border-gray-700"],
    [/bg-gray-900\/40/g, "bg-white dark:bg-gray-900/40"],
    [/bg-gray-900\/60/g, "bg-white dark:bg-gray-900/60"],
    [/from-gray-900\/60 to-gray-800\/40/g, "from-white to-gray-50 dark:from-gray-900/60 dark:to-gray-800/40"],
    [/bg-gray-900\/80/g, "bg-gray-100\/50 dark:bg-gray-900/80"],
    [/bg-gray-900\/50/g, "bg-gray-100 dark:bg-gray-900/50"],
    [/bg-gray-800\/40/g, "bg-gray-100 dark:bg-gray-800/40"],
    [/bg-gray-800\/80/g, "bg-gray-200 dark:bg-gray-800/80"],
    [/bg-gray-800\/50/g, "bg-gray-200 dark:bg-gray-800/50"],
    [/bg-gray-800/g, "bg-white dark:bg-gray-800"],
    [/bg-gray-900/g, "bg-white dark:bg-gray-900"],
    [/bg-gray-950\/80/g, "bg-gray-50 dark:bg-gray-950/80"],
    [/bg-gray-950/g, "bg-gray-50 dark:bg-gray-950"],
    [/blur-\[120px\]/g, "blur-[80px] opacity-70 dark:opacity-100"],
    [/shadow-xl/g, "shadow-md dark:shadow-xl"],
    [/shadow-2xl/g, "shadow-lg dark:shadow-2xl"],
    [/shadow-\[0_0_30px_-5px_rgba\(59,130,246,0\.3\)\]/g, "shadow-[0_0_15px_-5px_rgba(59,130,246,0.2)]"],
    [/drop-shadow-\[0_0_15px_rgba\(250,204,21,0\.5\)\]/g, "drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"],
    [/drop-shadow-\[0_0_15px_rgba\(129,140,248,0\.5\)\]/g, "drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]"],
    [/ring-4 ring-blue-500\/20 animate-pulse/g, "ring-2 ring-blue-500/20 animate-pulse opacity-80"],
    [/bg-gradient-to-br from-indigo-300 to-purple-300/g, "bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300"]
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    fs.writeFileSync(file, content, 'utf-8');
}

console.log('UI Fixes Applied successfully');
