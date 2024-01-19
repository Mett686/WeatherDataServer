const express = require('express')
const app = express();
const cors = require('cors')
const fs = require('fs');


// Settings
const PORT = 3000;
const DIR = __dirname;

//-----spaghetti-beyond-------

function logData(data) {
    var FILE = DIR + `/data/${data.time.slice(0, 4)}.csv`;
    const line = `${data.time.slice(0,-5)}Z,${data.temperature},${data.pressure},${data.humidity},${data.windSpeed},${data.windDirection},${data.radiation}\r\n`;
    
    try {
        fs.appendFileSync( FILE, line);
      } catch (err) {
        console.error(err);
      };
};

// Express
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    console.log(`${req.method} ${req.object} HTTP/${req.httpVersion}`);
    // work in progress
    res.sendFile(DIR + '/index.html');
});

app.get('/data', (req, res) => {
    console.log(`${req.method} ${req.path} HTTP/${req.httpVersion}`);

    res.json( data );
});

app.get('/array/:startTime/:stopTime', (req, res) => {
  const startTime = new Date(req.params.startTime);
  const stopTime = new Date(req.params.stopTime);

  const csvFile = `${startTime.toISOString().slice(0, 4)}.csv`;

  console.log('array request');

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

    console.log(`Received data ${data.time.replace('T' ,' ').slice(0,-5)}`);
    logData(data)

    res.send(req.statusMessage);
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});