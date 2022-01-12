const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const cors = require('cors');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const RPC = process.env.RPC || "http://localhost:7545";
console.log(`Conectado a geth RPC @ ${RPC}`);
const web3 = new Web3(new Web3.providers.HttpProvider(RPC))

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var PORT = process.env.PORT || 3000; 
// RUTAS
// =============================================================================
var router = express.Router();              // Instancia de Express router

const processTxs = async function(txs, latest = false) {
  let transactions = [];
  if(txs.length > 0){
    for (const tx of txs) {
      if(latest){
        if(transactions.length < 10){
	        var t = await web3.eth.getTransaction(tx);
          transactions.push(t);
        }
      }else{
        transactions.push(await web3.eth.getTransaction(tx));
      }
      return transactions;
    }
  }else{
    return transactions
  }
}
router.get('/accounts', async function(req, res){
  await web3.eth.getAccounts(function (error, result){
    if(!error){
      res.json({
        status: 'success',
        result
      });
    }else{
      res.json({
        status: 'error',
        error,
      })
    }
    
  });
});
router.get('/transfer/:from/:to/:amount', function(req, res){
  const transactionObject = {
    from: req.params.from,
    to: req.params.to,
    value: req.params.amount,
  };
  web3.eth.sendTransaction(transactionObject, function (error, result){
    if(!error){
      res.json({
        status: 'success',
        result,
      })
    }else{
      console.error(error);
    }
  });
});
// GET http://localhost:8080/api/v1/latest
router.get('/latest', function(req, res) {
  console.log('latest');
    const n = 10;
    let blocks = [];
    let txs = [];
    web3.eth.getBlockNumber(async function(error, result){
      if (!error){
        var latestBlock = result;
        console.log(latestBlock);
        for (var i = 0; i < n; i++) {
          var block = await web3.eth.getBlock(latestBlock - i);
          // Block data
          const number = block.number;
          const hash = block.hash;
          const time = block.timestamp;
          txs = await processTxs(block.transactions, true)
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
      console.log(txs);
      res.json({ txs });
    });
    
});

router.get('/transaction/:hash', function (req,res) {
  const t = web3.eth.getTransaction(req.params.hash);
  res.json(t);
});

// more routes for our API will happen here

// REGISTRAR RUTAS -------------------------------
// Todas las rutas van a tener el prefijo /api/v1
const PREFIX = '/api/v1';
app.use(PREFIX  , router);

// INICIO EL SERVIDOR
app.listen(PORT);
console.log('Escuchando en puerto: ' + PORT);
