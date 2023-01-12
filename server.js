//
const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');

let data;

//Settings
const port = 3000;
const dir = 'C:/Users/knote/Desktop/weather/'

//CSV data logger
function logData(where) {
  
    var FILE = `${where}/weather-${data.time.slice(0, 10)}.csv`;
    
    const line = `${data.time},${data.temperature},${data.pressure},${data.humidity},${data.windSpeed},${data.windDirection},${data.radiation},${data.battery}\r\n`;
    
    try {
      fs.appendFileSync( FILE, line);
    } catch (err) {
      console.error(err);
    };
};

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
    
    logData(dir + 'data/');
    
    console.log(time + ' - Received data')
    res.send(req.statusMessage);
});

//Listener
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});