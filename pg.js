const Pool = require("pg").Pool
require("dotenv").config()

const pool = new Pool ({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD.toString(),
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  host: process.env.PG_HOST
})

module.exports = pool