const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const RPC = process.env.RPC || "http://10.10.0.3:8545";
console.log(`Conectado a geth RPC @ ${RPC}`);
const web3 = new Web3(new Web3.providers.HttpProvider(RPC))

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var PORT = process.env.PORT || 3000; 
// RUTAS
// =============================================================================
var router = express.Router();              // Instancia de Express router
const processTxs = function(txs, latest = false) {
  let transactions = [];
  txs.forEach(tx => {
    if(latest){
      if(transactions.length < 10){
        transactions.push(web3.eth.getTransaction(tx));
      }
    }else{
      transactions.push(web3.eth.getTransaction(tx));
    }
    return transactions;
  });
}
// GET http://localhost:8080/api/blocks
router.get('/latest', function(req, res) {
    const n = 10;
    let blocks = [];
    let txs = [];
    web3.eth.getBlockNumber(async function(error, result){ 
      if (!error){
        console.log("block number => ", result)
        var latestBlock = result;
        for (var i = 0; i < n; i++) {
          var block = await web3.eth.getBlock(latestBlock - i);
          console.log(block);
          // Block data
          const number = block.number;
          const hash = block.hash;
          const time = block.timestamp;
          txs = processTxs(block.transactions, true)
          blocks.push({
            number,
            hash,
            time
          });
        } 
      }else{
        return res.status(500).json({
          message: "Error al obtener el ultimo bloque"
        });
      }
      res.json({ blocks, txs });
    });
    
});

router.get('/transactions', function (req,res) {
  res.json();
});

// more routes for our API will happen here

// REGISTRAR RUTAS -------------------------------
// Todas las rutas van a tener el prefijo /api/v1
const PREFIX = '/api/v1';
app.use(PREFIX  , router);

// INICIO EL SERVIDOR
app.listen(PORT);
console.log('Escuchando en puerto: ' + PORT);