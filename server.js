const express = require('express')
const app = express();
const cors = require('cors')
const fs = require('fs');


// Settings
const PORT = XXXX;//set this
const DIR = __dirname;
var dataPath = DIR + '/data/';

const decimal = { // This sets decimal places
  temperature: 1,
    pressure: 2,
    humidity: 2,
    windSpeed: 2,
    windDirection: 0,
    radiation: 2 
}

const radiationK = 100; // Const for radiation conversion

//-----spaghetti-beyond-------
let logDataN = 0;
let dataSum = {
    temperature: 0,
    pressure: 0,
    humidity: 0,
    windSpeed: 0,
    radiation: 0,
    windDirection: {
        sin: 0,
        cos: 0
    }
};

function avg(sum) {
  return sum / logDataN
}

function DegToRad(degrees) {
  return degrees * (Math.PI /180)
}

function logData(data) {
  // Here we sum the data for dataWrite to average them
  dataSum.temperature += parseFloat(data.temperature);
  dataSum.pressure += parseInt(data.pressure);
  dataSum.humidity += parseFloat(data.humidity);
  dataSum.windSpeed += parseFloat(data.windSpeed);
  dataSum.radiation += parseInt(data.radiation);
  dataSum.windDirection.sin += Math.sin(DegToRad(data.windDirection)) //This is here for the possibility that the windDirection values are around 0/360 which would result in 180 average, which is exactly opposite of the actual value
  dataSum.windDirection.cos += Math.cos(DegToRad(data.windDirection))
  logDataN +=1
}

function dataWrite() {
  let dataAverage = {
      temperature: 0,
      pressure: 0,
      humidity: 0,
      windSpeed: 0,
      radiation: 0,
      windDirection: {
          degrees: 0,
          sin: 0,
          cos: 0
  }}

  dataAverage.temperature = avg(dataSum.temperature).toFixed(decimal.temperature);
  dataAverage.pressure = (avg(dataSum.pressure)/1000).toFixed(decimal.pressure);
  dataAverage.humidity = avg(dataSum.humidity).toFixed(decimal.humidity);
  dataAverage.windSpeed = avg(dataSum.windSpeed).toFixed(decimal.windSpeed);
  dataAverage.radiation = avg(dataSum.radiation).toFixed(decimal.radiation + 2) * radiationK;//Gut spaghetti
  
  // This puts the windDirection back together
  dataAverage.windDirection.sin = avg(dataSum.windDirection.sin);
  dataAverage.windDirection.cos = avg(dataSum.windDirection.cos);

  const degrees = Math.atan2(dataAverage.windDirection.sin, dataAverage.windDirection.cos) * (180 / Math.PI);
  dataAverage.windDirection = (( degrees + 360 ) % 360).toFixed(decimal.windDirection);
  
  //Turn NaN if not receiving data to null for the  graph puposes
  for (let key in dataAverage) {
    if(isNaN(dataAverage[key])) {
      dataAverage[key] = null;
    }
  }

  // Now the program tries to write the averages to a file
  dataString = `${(new Date()).toISOString()},${dataAverage.temperature},${dataAverage.pressure},${dataAverage.humidity},${dataAverage.windSpeed},${dataAverage.windDirection},${dataAverage.radiation}\r\n`

  try {
    fs.appendFileSync(dataPath + new Date().toISOString().slice(0, 4) + '.csv', dataString);
    dataString = '';
    dataSum = {
      temperature: 0,
      pressure: 0,
      humidity: 0,
      windSpeed: 0,
      radiation: 0,
      windDirection: {
          sin: 0,
          cos: 0
      }}
    logDataN = 0
  } catch (err) {
      console.error(err);
  }
  console.log(new Date().toISOString() + ' Written data');
}

function calculateNextWriteTime() {
  const now = new Date();
  const minutes = now.getMinutes();
  let nextWriteMinutes = Math.ceil(minutes / 10) * 10 + 10; // This rounds up to nearest 10 minutes and adds 10, otherwise it would spam if the nearest ten minutes are now
  
  if (minutes >= 50) { // This is here for the save to trigger at full hours
    nextWriteMinutes = 60;
  }

  const nextWriteTime = new Date(now);
  nextWriteTime.setMinutes(nextWriteMinutes, 0, 0);

  const timeUntilNextWrite = nextWriteTime - now;

  return timeUntilNextWrite;
}

function scheduleNextWrite() { 
  const timeUntilNextWrite = calculateNextWriteTime();

  setTimeout(() => {
      dataWrite();
      scheduleNextWrite();
  }, timeUntilNextWrite);
}

// Express
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    console.log(`${req.method} ${req.object} HTTP/${req.httpVersion}`);

    res.sendFile(DIR + '/index.html');
});

app.get('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    res.json( data );
});

app.get('/data/:file', (req, res) => {
  console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

  res.download( dataPath + req.params.file );
});

app.get('/array/:startTime/:stopTime', (req, res) => { //Technically useless now
  const startTime = new Date(req.params.startTime);
  const stopTime = new Date(req.params.stopTime);

  const csvFile = `${startTime.toISOString().slice(0, 4)}.csv`;

  try {
    const csv = fs.readFileSync( dataPath + csvFile , { encoding: 'utf8' });

    const csvArray = csv.split(`\r\n`); // Split the CSV string into an array of lines

    const filteredCsvArray = csvArray
      .filter((line, index) => {
        if (index === 0) {
          // Include the header row in the result
          return true;
        }

        const values = line.split(','); // Assuming values are separated by commas
        const timeValue = new Date(values[0]); // Assuming time is the first element in each row

        return !isNaN(timeValue) && timeValue >= startTime && timeValue <= stopTime;
      })
      .map(line => line.split(',').map(value => isNaN(value) ? value : parseFloat(value)));

    res.json(filteredCsvArray);

  } catch (err) {
    console.error('Error reading the file:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.put('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);
    
    data = req.body;
    data.time = new Date().toISOString();

    console.log(`${data.time.replace('T' ,' ').slice(0,-1)} Received data`);
    logData(data)

    res.send(req.statusMessage);
});

// This starts the app
scheduleNextWrite();

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});