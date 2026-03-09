const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);
app.use((req, res) => res.status(404).send('404 Not Found'));

app.listen(3005, async () => {
    try {
        const res = await fetch('http://localhost:3005/auth/login', { 
            method: 'POST', 
            body: '{}', 
            headers: {'Content-Type': 'application/json'} 
        });
        console.log("Status:", res.status);
        console.log("Response:", await res.text());
    } catch(err) {
        console.error("Error:", err);
    }
    process.exit(0);
});
