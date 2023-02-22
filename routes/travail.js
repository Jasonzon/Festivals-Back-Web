const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

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

router.get("/benevole/:id", async (req,res) => {
    try {
        const {id} = req.params
        const allTravaux = await pool.query("select * from travail inner join zone on (zone.zone_id = travail.travail_zone) inner join creneau on (creneau.creneau_id = travail.travail_creneau) where travail_benevole = $1",[id])
        return res.json(allTravaux.rows).status(200)
    } catch (err) {
        console.error(err.message)
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {benevole,zone,creneau} = req.body
            const travail = await pool.query("insert into travail (travail_benevole, travail_zone, travail_creneau) values ($1, $2, $3) returning *",[benevole,zone,creneau])
            if (travail.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(travail.rows[0]).status(200)
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
            const {benevole,zone,creneau} = req.body
            const travail = await pool.query("update travail set travail_benevole = $2, travail_zone = $3, travail_creneau = $4 where travail_id = $1 returning *",[id,benevole,zone,creneau])
            if (travail.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(travail.rows[0]).status(200)
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
            const travail = await pool.query("delete from travail where travail_id = $1",[id])
            return res.status(500).send("Deleted")
        }
        else {
            return res.status(403).send("Not Authorized")
        }
    } catch (err) {
        console.error(err.message)
    }
})

module.exports = router