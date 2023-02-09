const router = require("express").Router()
const pool = require("../db")

router.get("/", async (req,res) => {
    try {
        const allCreneaux = await pool.query("select * from creneau")
        return res.json(allCreneaux.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const creneau = await pool.query("select * from creneau where creneau_id = $1",[id])
        if (creneau.rows.length === 0) {
            return res.status(404)
        }
        else {
            return res.json(creneau.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/zone/:id", async (req,res) => {
    try {
        const {id} = req.params
        const creneau = await pool.query("select distinct creneau_id,creneau_debut,creneau_fin  from creneau inner join travail on (creneau.creneau_id = travail.travail_creneau) inner join zone on (travail.travail_zone = zone.zone_id) where zone_id = $1",[id])
        return res.json(creneau.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.post("/", async (req,res) => {
    try {
        const {debut,fin} = req.body
        const creneau = await pool.query("insert into creneau (creneau_debut,creneau_fin) values ($1,$2) returning *",[debut,fin])
        if (creneau.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(creneau.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.put("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const {debut,fin} = req.body
        const creneau = await pool.query("update creneau set creneau_debut = $2, creneau_fin = $3 where creneau_id = $1 returning *",[id,debut,fin])
        if (creneau.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(creneau.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.delete("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const creneau = await pool.query("delete from creneau where creneau_id = $1 returning *",[id])
        if (creneau.rows.length === 0) {
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