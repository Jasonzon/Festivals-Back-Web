const router = require("express").Router()
const pool = require("../db")

router.get("/", async (req,res) => {
    try {
        const allBenevoles = await pool.query("select * from benevole")
        return res.json(allBenevoles.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const benevole = await pool.query("select * from benevole where benevole_id = $1",[id])
        if (benevole.rows.length === 0) {
            return res.status(404)
        }
        else {
            return res.json(benevole.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.post("/", async (req,res) => {
    try {
        const {prenom,nom,mail} = req.body
        const benevole = await pool.query("insert into benevole (benevole_prenom,benevole_nom,benevole_mail) values ($1, $2, $3) returning *",[prenom,nom,mail])
        if (benevole.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(benevole.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.put("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const {prenom,nom,mail} = req.body
        const benevole = await pool.query("update benevole set benevole_prenom = $2, benevole_nom = $3, benevole_mail = $4 where benevole_id = $1 returning *",[id,prenom,nom,mail])
        if (benevole.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(benevole.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.delete("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const benevole = await pool.query("delete from benevole where benevole_id = $1 returning *",[id])
        if (benevole.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

module.exports = router