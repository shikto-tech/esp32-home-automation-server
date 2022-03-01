const express = require('express')
const app = express()
const cors = require("cors")
const port = 3000

const JSONdb = require('simple-json-db');
const db = new JSONdb('./database.json');

let allTasks = {
    tasks: []
}

if(db.get("tasks") != undefined) allTasks = JSON.parse(db.get("tasks"))

app.use(
    cors({
        origin: "*"
    })
)


app.get('/get', (req, res) => {
    let default_out = "0"
    let id = req.query.id
    console.log("get req: " + id)
    if(id == undefined || id == "") res.send("")
    let db_out = db.get(id)
    if(db_out == undefined)db_out = default_out
    res.send(db_out)
})
app.get('/toggle', (req, res) => {
    let default_out = "0"
    let id = req.query.id
    if(id == undefined || id == "") res.send("")
    let on = db.get(id) || default_out
    if(on == default_out) on = "1"
    else on = default_out
    db.set(id, on)
    res.send(on)
    console.log("toggle")
})
app.get('/name', (req, res) => {
    let id = req.query.id
    let default_name = "Toggle #" + id
    if(id == undefined || id == "") res.send("")
    let outName = db.get("name_" + id) || default_name
    res.send(outName)
    console.log("outName")
})
app.get('/set_name', (req, res) => {
    console.log("try new_name")
    let id = req.query.id
    let new_name = req.query.name
    let default_name = "Toggle #" + id
    if(id == undefined || id == "") res.send("")
    if(new_name == undefined || new_name == "") res.send("")
    db.set("name_" + id, new_name)
    res.send(new_name)
    console.log("new_name")
})
app.get('/set', (req, res) => {
    let id = req.query.id
    let on = req.query.on
    if(id == undefined || id == "") res.send("")
    if(on == undefined || on == "") res.send("")
    db.set(id, on)
    res.send("done")
})
app.get('/getall', (req, res) => {
    let default_out = "0"

    let c1 = db.get("5") || default_out
    let c2 = db.get("18") || default_out
    let c3 = db.get("19") || default_out

    let output_1 = 0
    let output_2 = 0
    let output_3 = 0

    if(c1 != default_out) output_1 = 1
    if(c2 != default_out) output_2 = 1
    if(c3 != default_out) output_3 = 1

    res.send("" + output_1 + output_2 + output_3)
})
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
app.get('/add_task', (req, res) => {
    let id = req.query.id
    allTasks.tasks.push({
        id: id,
        start_time: req.query.start_time,
        end_time: req.query.end_time,
        pin: req.query.pin,
        frequency: req.query.frequency,
        done: false
    })
    db.set("tasks", JSON.stringify(allTasks))
    res.send(db.get("tasks"))
})
app.get('/remove_task', (req, res) => {
    let id = req.query.id
    let target = -1
    for(i in allTasks.tasks){
        if(allTasks.tasks[i].id == id){
            target = i
        }
    }
    if(target > -1){
        allTasks.tasks.splice(target, 1);
    }
    db.set("tasks", JSON.stringify(allTasks))
    res.send(db.get("tasks"))
})
app.get('/database.json', (req, res) => {
    res.sendFile(__dirname + "/database.json")
})

app.use(express.static(__dirname + '/'))



app.stat

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

setInterval(CheckForTask, 1000)

function CheckForTask(){
    for(i in allTasks.tasks){
        let task_data = allTasks.tasks[i]
        if(task_data.done == false) continue;
        let startTimeData = new TimeData(task_data.start_time)
        let endTimeData = new TimeData(task_data.end_time)
        let currentTime = new TimeData(getCurrentTime())

        let crossedStartTime  =false;
        let beforeEndTime  =false;
        if(currentTime.hour >= startTimeData.hour){
            if(currentTime.minutes >= startTimeData.minutes){
                let canBeDone = (currentTime.meridian == "PM" && (startTimeData.meridian == "PM" || startTimeData.meridian == "AM"))
                let canBeDone_2 = (currentTime.meridian == "AM" && (startTimeData.meridian == "AM"))
                if(canBeDone || canBeDone_2){
                    crossedStartTime = true;
                }
            }    
        }
        if(currentTime.hour <= endTimeData.hour){
            if(currentTime.minutes <= endTimeData.minutes){
                let canBeDone = (currentTime.meridian == "PM" && (endTimeData.meridian == "PM"))
                let canBeDone_2 = (currentTime.meridian == "AM" && (endTimeData.meridian == "AM" || endTimeData.meridian == "PM"))
                if(canBeDone || canBeDone_2){
                    beforeEndTime = true;
                }
            }    
        }

        if(beforeEndTime && crossedStartTime){
            db.set(task_data.pin, "1")
            task_data.done = true
        }
        if(!beforeEndTime && crossedStartTime){
            db.set(task_data.pin, "0")
            task_data.done = true
        }
    }
}

class TimeData{
    hour = 0;
    minutes = 0;
    meridian = "AM"

    constructor(data_raw){
        let bDataRaw = data_raw.split(" ")
        let bDataRaw_2 = bDataRaw[0].split(":")
        this.meridian = bDataRaw[1]
        this.hour = bDataRaw_2[0]
        this.minutes = bDataRaw_2[1]
    }
}

function getCurrentTime() {
    var currentTime;
    // here we can give our date
    var currentDate = addMinutes(new Date(Date.now()), 360);
    // OR we can define like that also for current date
    // var currentDate = new Date();
    var hour = currentDate.getHours();
    var meridiem = hour >= 12 ? "PM" : "AM";
    currentTime = ((hour + 11) % 12 + 1) + ":" + currentDate.getMinutes() + " "+ meridiem;
    return currentTime;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}