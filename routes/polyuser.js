const router = require("express").Router()
const pool = require("../db")
const jwt = require("jsonwebtoken")
const auth = require("../utils/auth")
const bcrypt = require("bcrypt")
const jwtGenerator = require("../utils/jwtGenerator")

router.get("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const allPolyusers = await pool.query("SELECT * FROM polyuser")
            res.status(200).json(allPolyusers.rows)
        }
        else {
            return res.status(403).send("Not Authorized")
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
})

router.get("/id/:id", auth, async (req,res) => {
    try {
        const {id} = req.params
        if (req.polyuser === id) {
            const polyuser = await pool.query("SELECT * FROM polyuser WHERE polyuser_id = $1",[id])
            if (polyuser.rows.length === 0) {
                return res.status(404).send("Not found")
            }
            else {
                res.status(200).json(polyuser.rows[0])
            }
        }
        else {
            res.status(403).send("Not authorized")
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
})

router.get("/mail/:id", async (req,res) => {
    try {
        const {id} = req.params
        const polyuser = await pool.query("SELECT polyuser_mail FROM polyuser WHERE polyuser_mail = $1",[id])
        res.status(200).json(polyuser.rows)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
})

router.get("/auth", async (req,res) => {
    try {
        const jwtToken = req.header("token")
        if (!jwtToken) {
            res.status(403).send("No authentication token")
        }
        else {
            const payload = jwt.verify(jwtToken, process.env.jwtSecret)
            if (!payload) {
                res.status(403).send("Not authorized")
            }
            else {
                res.status(200).json({polyuser_id:payload.polyuser,polyuser_mail:payload.mail})
            }
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
})

router.post("/", async (req,res) => {
    try {
        const {nom, prenom, mail, password} = req.body
        const saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)
        const bcryptPassword = await bcrypt.hash(password, salt)
        const newPolyuser = await pool.query("INSERT INTO polyuser (polyuser_nom, polyuser_prenom, polyuser_mail, polyuser_password) VALUES ($1, $2, $3, $4) RETURNING *", [nom, prenom, mail, bcryptPassword])
        const token = jwtGenerator(newPolyuser.rows[0].polyuser_id,newPolyuser.rows[0].polyuser_role,newPolyuser.rows[0].polyuser_mail)
        res.status(200).json({rows:newPolyuser.rows,token})
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
})

router.post("/connect", async (req,res) => {
    try {
        const {mail, password} = req.body
        const newPolyuser = await pool.query("SELECT * FROM polyuser WHERE polyuser_mail = $1", [mail])
        if (newPolyuser.rows.length !== 0) {
            const validPassword = await bcrypt.compare(password,newPolyuser.rows[0].polyuser_password)
            if (validPassword) {
                const token = jwtGenerator(newPolyuser.rows[0].polyuser_id,newPolyuser.rows[0].polyuser_role,newPolyuser.rows[0].polyuser_mail)
                res.status(200).json({rows:newPolyuser.rows,token})
            }
            else {
                return res.status(403).send({rows:[]})
            }
        }
        else {
            return res.status(404).send("Not found")
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
})

router.put("/id/:id", auth, async (req,res) => {
    try {
        const {id} = req.params
        const {name, description} = req.body
        const user = req.polyuser
        if (user && user.toString() === id.toString()) {
            const updatePolyuser = await pool.query("UPDATE polyuser SET polyuser_name = $2, polyuser_description = $3 WHERE polyuser_id = $1 RETURNING *",[id, name, description])
            res.status(200).json(updatePolyuser.rows[0])
        }
        else {
            return res.status(403).send("Not Authorized")
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
})

module.exports = router