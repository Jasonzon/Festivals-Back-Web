const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const allJeux = await pool.query("select * from jeu left join affectation on (jeu.jeu_id = affectation.affectation_jeu) left join zone on (zone.zone_id = affectation.affectation_zone)")
        return res.json(allJeux.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const jeu = await pool.query("select * from jeu where jeu_id = $1",[id])
        if (jeu.rows.length === 0) {
            return res.status(404)
        }
        else {
            return res.json(jeu.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {name,type} = req.body
            const jeu = await pool.query("insert into jeu (jeu_name, jeu_type) values ($1, $2) returning *",[name,type])
            if (jeu.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(jeu.rows[0]).status(200)
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
            const {name,type} = req.body
            const jeu = await pool.query("update jeu set jeu_name = $2, jeu_type = $3 where jeu_id = $1 returning *",[id,name,type])
            if (jeu.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(jeu.rows[0]).status(200)
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
            const jeu = await pool.query("delete from jeu where jeu_id = $1 returning *",[id])
            if (jeu.rows.length === 0) {
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