//
const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');


//Settings
const port = 3000;
const dataFolder = 'C:/Users/knote/Desktop/weather/data/';


let data;
let tenMin;
let logLine = `${data.time},${data.temperature},${data.pressure},${data.humidity},${data.windSpeed},${data.windDirection},${data.radiation},${data.battery}\r\n`;

//CSV data logger
function logData(what, where) {
    try {
      fs.appendFileSync( where, what);
    } catch (err) {
      console.error(err);
    };
};

function CHMU() {
    tenMin.concat(data);
    //check the time
    //do nothing or calculate, save and reset values
}

//This defines how to interpret incoming data
app.use(bodyParser.text())

//Get request for the main page
app.get('/', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    res.sendFile( 'index.html', { root : __dirname});
});

//Json file request
app.get('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    res.send( data );
});

//Data receiver
app.put('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);
    
    const [battery,temperature,pressure,humidity,windDirection,windSpeed,radioactivity] = req.body.split(',');
    const time = new Date().toISOString();
    data = {time,temperature,pressure,humidity,windDirection,windSpeed,radioactivity,battery};
    
    logData(logLine, dataFolder + `/weather-${data.time.slice(0, 10)}.csv`);
    
    console.log(time + ' - Received data');
    res.send(req.statusMessage);
});

//Listener
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
