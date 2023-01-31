const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const db_connect = require("./db")

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); //For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:project/", (req, res) => {
  res.sendFile(process.cwd() + '/views/issue.html');
});

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});


fccTestingRoutes(app);

db_connect(async() => {
  console.log("Conectado a base de datos")
  
  apiRoutes(app);
}).catch(err => {
  console.log(err)
})

app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log(`Your app is listening on port ${listener.address().port}`);

  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 8000);
  }
});

module.exports = app;
