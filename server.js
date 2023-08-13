//
const express = require('express');
const app = express();
const fs = require('fs');

//Settings
const port = 3000;
const dir = 'C:/Users/knote/Desktop/weather/';


function logData(data, PATH) {
  
    var FILE = `${PATH}/weather-${data.time.slice(0, 10)}.csv`;
    
    const line = `${data.time},${data.temperature},${data.pressure},${data.humidity},${data.windSpeed},${data.windDirection},${data.radiation}\r\n`;
    
    try {
      fs.appendFileSync( FILE, line);
    } catch (err) {
      console.error(err);
    };
};

//This is here for the receiver to see req.body
app.use(express.json());

//Get request for the main page
app.get('/', (req, res) => {
    console.log(`${req.method} ${req.object} HTTP/${req.httpVersion}`);

    res.sendFile( dir + '/index.html');
});

//Json file request
app.get('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    res.send( data );
});

//Data receiver
app.put('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);
    
    data = req.body;
    data.time = new Date().toISOString();

    console.log(`Rceived data ${data.time.replace('T' ,' ').slice(0,-5)}`);

    logData(data, dir + 'data/')
    res.send(req.statusMessage);
});

//Listener
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
