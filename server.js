const express = require('express')
const app = express()
const port = 3000

const JSONdb = require('simple-json-db');
const db = new JSONdb('./database.json');

app.get('/get', (req, res) => {
    let default_out = "0"
    let id = req.query.id
    console.log("get req: " + id)
    if(id == undefined || id == "") res.send("")
    let db_out = db.get(id)
    if(db_out == undefined)db_out = default_out
    if(db_out == 0) res.status(400);
    if(db_out == 1) res.status(200);
    res.send(db_out)
})
app.get('/set', (req, res) => {
    let id = req.query.id
    let on = req.query.on
    if(id == undefined || id == "") res.send("")
    if(on == undefined || on == "") res.send("")
    db.set(id, on)
    res.send("done")
})
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})