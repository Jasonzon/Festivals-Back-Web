const router = require("express").Router()
const pool = require("../db")

router.get("/", async (req,res) => {
    try {
        const allTravaux = await pool.query("select * from travail")
        return res.json(allTravaux.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const travail = await pool.query("select * from travail where travail_id = $1",[id])
        if (travail.rows.length === 0) {
            return res.status(404)
        }
        else {
            return res.json(travail.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.post("/", async (req,res) => {
    try {
        const {benevole,zone,creneau} = req.body
        const travail = await pool.query("insert into travail (travail_benevole, travail_zone, travail_creneau) values ($1, $2, $3) returning *",[benevole,zone,creneau])
        if (travail.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(travail.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.put("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const {benevole,zone,creneau} = req.body
        const travail = await pool.query("update travail set travail_benevole = $2, travail_zone = $3, travail_creneau = $4 where travail_id = $1 returning *",[id,benevole,zone,creneau])
        if (travail.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(travail.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.delete("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const travail = await pool.query("delete from travail where travail_id = $1 returning *",[id])
        if (travail.rows.length === 0) {
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