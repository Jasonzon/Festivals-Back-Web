const router = require("express").Router()
const pool = require("../db")

router.get("/", async (req,res) => {
    try {
        const allZones = await pool.query("select * from zone")
        return res.json(allZones.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const zone = await pool.query("select * from zone where zone_id = $1",[id])
        if (zone.rows.length === 0) {
            return res.status(404)
        }
        else {
            return res.json(zone.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.get("/creneau/:id", async (req,res) => {
    try {
        const {id} = req.params
        const zone = await pool.query("select distinct zone_id,zone_name from zone inner join travail on (zone.zone_id = travail.travail_zone) inner join creneau on (travail.travail_creneau = creneau.creneau_id) where creneau_id = $1",[id])
        return res.json(zone.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.post("/", async (req,res) => {
    try {
        const {name} = req.body
        const zone = await pool.query("insert into zone (zone_name) values ($1) returning *",[name])
        if (zone.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(zone.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.put("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const {name} = req.body
        const zone = await pool.query("update zone set zone_name = $2 where zone_id = $1 returning *",[id,name])
        if (zone.rows.length === 0) {
            return res.status(500)
        }
        else {
            return res.json(zone.rows[0]).status(200)
        }
    } catch (err) {
        console.error(err.message)
    }
})

router.delete("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const zone = await pool.query("delete from zone where zone_id = $1 returning *",[id])
        if (zone.rows.length === 0) {
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