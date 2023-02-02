const express = require("express")
const app = express()
const cors = require("cors")
const PORT = process.env.PORT || 5000
const path = require('path');

app.use(cors())
app.use(express.json())

/*
app.get("/*", (req,res) => {
    res.sendFile(path.join(__dirname,"client/build/index.html"))
})
*/

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})