const express = require('express');
const app = express();
const fs = require('fs');

//Settings
const PORT = 3000;
const DATADIR = __dirname;
//-----spaghetti-beyond-------

function logData(data) {
    var FILE = DATADIR + `/data/${data.time.slice(0, 7)}.csv`;
    const line = `${data.time},${data.temperature},${data.pressure},${data.humidity},${data.windSpeed},${data.windDirection},${data.radiation}\r\n`;
    
    try {
        fs.appendFileSync( FILE, line);
      } catch (err) {
        console.error(err);
      };
};

//csv to array (file is the year and month '2020-12')
function getArray(file) {
    fs.open( DATADIR + `/data/${file}`,'r' , function (f) {
        conso
    })
};

//Express
app.use(express.json());

app.get('/', (req, res) => {
    console.log(`${req.method} ${req.object} HTTP/${req.httpVersion}`);
    //work in progress
    res.sendFile(DATADIR + '/website/Home.html');
});

app.get('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    res.json( data );
});
//finish this!!
app.get('/array', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    

    res.json();
});

app.put('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);
    
    data = req.body;
    data.time = new Date().toISOString().slice(0,17);

    console.log(`Received data ${data.time.replace('T' ,' ').slice(0,-5)}`);
    logData(data)
    //console.log(data.toString())

    res.send(req.statusMessage);
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});