const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const allAffectations = await pool.query("select * from affectation")
        return res.json(allAffectations.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const affectation = await pool.query("select * from affectation where affectation_id = $1",[id])
        if (affectation.rows.length === 0) {
            return res.status(404)
        }
        else {
            return res.json(affectation.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {jeu,zone} = req.body
            const affectation = await pool.query("insert into affectation (affectation_jeu, affectation_zone) values ($1, $2) returning *",[jeu,zone])
            if (affectation.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(affectation.rows[0]).status(200)
            }
        }
        else {
            return res.status(403).send("Not Authorized")
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.put("/:id", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {id} = req.params
            const {jeu,zone} = req.body
            const affectation = await pool.query("update affectation set affectation_jeu = $2, affectation_zone = $3 where affectation_id = $1 returning *",[id,jeu,zone])
            if (affectation.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(affectation.rows[0]).status(200)
            }
        }
        else {
            return res.status(403).send("Not Authorized")
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.delete("/:id", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {id} = req.params
            const affectation = await pool.query("delete from affectation where affectation_id = $1 returning *",[id])
            if (affectation.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.status(200)
            }
        }
        else {
            return res.status(403).send("Not Authorized")
        }
    } catch (err) {
        console.error(err.message)
    }
})

module.exports = router