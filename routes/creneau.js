const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const creneaux = await pool.query("select * from creneau")
        const creneauxModifies = creneaux.rows.map((creneau) => {
            const debutModifie = new Date(creneau.creneau_debut)
            debutModifie.setHours(debutModifie.getHours() + 1)
            const finModifie = new Date(creneau.creneau_fin)
            finModifie.setHours(finModifie.getHours() + 1)
            return {
                creneau_id: creneau.creneau_id,
                creneau_debut: debutModifie.toISOString(),
                creneau_fin: finModifie.toISOString()
            }
        })
        return res.json(creneauxModifies).status(200)
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
            const creneauDebut = new Date(creneau.rows[0].creneau_debut)
            creneauDebut.setHours(creneauDebut.getHours() + 1)
            const creneauFin = new Date(creneau.rows[0].creneau_fin)
            creneauFin.setHours(creneauFin.getHours() + 1)
            const creneauModifie = {
                creneau_id: creneau.rows[0].creneau_id,
                creneau_debut: creneauDebut.toISOString(),
                creneau_fin: creneauFin.toISOString()
            }
            return res.json(creneauModifie).status(200)
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

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {debut,fin} = req.body
            const creneau = await pool.query("insert into creneau (creneau_debut,creneau_fin) values ($1::timestamp,$2::timestamp) returning *",[debut,fin])
            if (creneau.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(creneau.rows[0]).status(200)
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
            const {debut,fin} = req.body
            const creneau = await pool.query("update creneau set creneau_debut = $2, creneau_fin = $3 where creneau_id = $1 returning *",[id,debut,fin])
            if (creneau.rows.length === 0) {
                return res.status(500)
            }
            else {
                return res.json(creneau.rows[0]).status(200)
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
            const creneau = await pool.query("delete from creneau where creneau_id = $1 returning *",[id])
            if (creneau.rows.length === 0) {
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