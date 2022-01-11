const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NODEURL || "http://10.10.0.3:8545"))

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var PORT = process.env.PORT || 3000; 
// RUTAS
// =============================================================================
var router = express.Router();              // Instancia de Express router

// GET http://localhost:8080/api/blocks
router.get('/blocks', function(req, res) {
    var latestBlock = web3.eth.blockNumber;
    const result = [];
    for (var i = 0; i < 10; i++) {
      var block = web3.eth.getBlock(latestBlock - i);
      var number = block.number;
      var hash = block.hash;
      var time = block.timestamp;
      result.push({
        number,
        hash,
        time
      });
    } 
    /*web3.eth.getBlockNumber().then((result) => {
        console.log(result)
    });*/
    res.json({ result });
});

// more routes for our API will happen here

// REGISTRAR RUTAS -------------------------------
// Todas las rutas van a tener el prefijo /api/v1
const PREFIX = '/api/v1';
app.use(PREFIX  , router);

// INICIO EL SERVIDOR
app.listen(PORT);
console.log('Escuchando en puerto: ' + PORT);