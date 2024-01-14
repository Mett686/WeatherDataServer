const express = require('express')
const app = express();
const fs = require('fs');

//Settings
const PORT = 3000;
const DIR = __dirname;

//-----spaghetti-beyond-------

function logData(data) {
    var FILE = DIR + `/weather-data/${data.time.slice(0, 7)}.csv`;
    const line = `${data.time},${data.temperature},${data.pressure},${data.humidity},${data.windSpeed},${data.windDirection},${data.radiation}\r\n`;
    
    try {
        fs.appendFileSync( FILE, line);
      } catch (err) {
        console.error(err);
      };
};

//Express
app.use(express.json());

app.get('/', (req, res) => {
    console.log(`${req.method} ${req.object} HTTP/${req.httpVersion}`);
    //work in progress
    res.sendFile(DIR + '/website/Home.html');
});

app.get('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    res.json( data );
});

app.get('/array/:startTime/:stopTime', (req, res) => {
  const startTime = req.params.startTime;
  const stopTime = req.params.stopTime;

  const csvFile = `${(req.params.startTime).slice(0, 7)}.csv`

  console.log('array request')

  try {
    const csv = fs.readFileSync(`${DIR}/data/${csvFile}`, { encoding: 'utf8' });

    const csvArray = csv.split(`\r\n`); // Split the CSV string into an array of lines

    const filteredCsvArray = csvArray
      .filter((line, index) => {
        if (index === 0) {
          // Include the header row in the result
          return true;
        }

        const values = line.split(','); // Assuming values are separated by commas
        const timeValue = new Date(values[0]); // Assuming time is the first element in each row

        const startTimeDate = new Date(startTime);
        const stopTimeDate = new Date(stopTime);

        return !isNaN(timeValue) && timeValue >= startTimeDate && timeValue <= stopTimeDate;
      });

    res.json(filteredCsvArray);

  } catch (err) {
    console.error('Error reading the file:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);
    
    data = req.body;
    data.time = new Date().toISOString().slice(0,17);

    console.log(`Received data ${data.time.replace('T' ,' ').slice(0,-5)}`);
    logData(data)

    res.send(req.statusMessage);
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});