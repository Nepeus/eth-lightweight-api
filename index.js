const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const RPC = process.env.RPC || "http://localhost:7545";
console.log(`Conectado a geth RPC @ ${RPC}`);
const web3 = new Web3(new Web3.providers.HttpProvider(RPC))

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// LOGGING
if(process.env.NODE_ENV == 'development'){
  app.use(morgan('dev', {
    stream: fs.createWriteStream('./logs/access-dev.log', {flags: 'a'})
  }));
}else{
  app.use(morgan('combined', {
    stream: fs.createWriteStream('./logs/access.log', {flags: 'a'})
  }));
}

var PORT = process.env.PORT || 3000; 

const processTxs = async function(txs, blockTimeStamp, latest = false) {
  let transactions = [];
  if(txs.length > 0){
    for (const tx of txs) {
      if(latest){
        if(transactions.length < 10){
	        await web3.eth.getTransaction(tx, function(error, result){
            if(!error){
              result.timestamp = blockTimeStamp;
              transactions.push(result);
            }else{
              console.error(Date.now()+' [web3.eth.getTransaction]');
            }
          });
        }
      }else{
        await web3.eth.getTransaction(tx, function(error, result){
          if(!error){
            result.timestamp = blockTimeStamp;
            transactions.push(result);
          }else{
            console.error(Date.now()+' [web3.eth.getTransaction]');
          }
        });
      }
      return transactions;
    }
  }else{
    return transactions
  }
}

// RUTAS
var router = express.Router();              // Instancia de Express router


router.get('/accounts', async function(req, res){
  await web3.eth.getAccounts(function (error, accounts){
    if(!error){
      res.json({
        status: 'success',
        accounts
      });
    }else{
      res.json({
        status: 'error',
        error,
      });
    }
  });
});
// TODO: Validar que tenga saldo suficiente
router.get('/transfer/:from/:to/:amount', function(req, res){
  const transactionObject = {
    from: req.params.from,
    to: req.params.to,
    value: req.params.amount,
  };
  web3.eth.getBalance(transactionObject.from, function (err, balance){
    if(!err){
      if(balance > transactionObject.value){
        web3.eth.sendTransaction(transactionObject, function (error, tx){
          if(!error){
            res.json({
              status: 'success',
              tx,
            })
          }else{
            console.error(error);
            res.json({
              status: 'error',
              error,
            });
          }
        });
      }else{
        res.json({
          status: 'error',
          error: 'Saldo insuficiente',
        });
      }
    }else{
      console.error('Error al obtener Balance');
      res.json({
        status: 'error',
        error: err,
      })
    }
    
  });
  
});
router.get('/latest', function(req, res) {
    const n = 10;
    let blocks = [];
    let txs = [];
    web3.eth.getBlockNumber(async function(error, result){
      if (!error){
        var latestBlock = result;
        for (var i = 0; i < n; i++) {
          var block = await web3.eth.getBlock(latestBlock - i);
          // Block data
          const number = block.number;
          const hash = block.hash;
          const time = block.timestamp;
          txs.push(...await processTxs(block.transactions, time, true));
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
      res.json({ block, txs });
    });
    
});
router.get('/block/:hash', function (req, res){
  web3.eth.getBlock(req.params.hash, function (error, block){
    if(!error){
      res.json({
        status: 'success',
        block
      });
    }else{
      console.error('ERROR al obtener el bloque');
      res.json({
        status: 'error',
        error
      })
    }
  });
  
});
router.get('/transaction/:hash', function (req,res) {
  web3.eth.getTransaction(req.params.hash, function (error, tx) {
    if(!error){
      res.json({
        status: 'success',
        tx
      });
    }else{
      console.error('ERROR al obtener la tx');
      res.json({
        status: 'error',
        error
      })
    }
  });
  
});

// more routes for our API will happen here

// REGISTRAR RUTAS -------------------------------
// Todas las rutas van a tener el prefijo /api/v1
const PREFIX = '/api/v1';
app.use(PREFIX  , router);

// INICIO EL SERVIDOR
app.listen(PORT);
console.log('Escuchando en puerto: ' + PORT);
