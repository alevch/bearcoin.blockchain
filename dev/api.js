//this is our blockchain SERVER: expose our blockhain f/n to the web  browser

const Blockchain = require('./blockchain.js');
const bodyParser = require('body-parser');
const bearcoin = new Blockchain();
const { v4: uuidv4 } = require('uuid');

const nodeAddress = uuidv4().split('-').join('');


const express = require('express')
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function(req, res) {
    res.send('Hello World')
})

app.get('/blockchain', function(req, res) {
    //this will display our total blockchain 
    //  res.send('Hello, Blockchain Build on JavaScript (Node.js & Express.js)');
    res.send(bearcoin);
    //res = the SERVERS/API's response 
})

app.post('/transaction', function(req, res) {
    //this will "send in" our transaction  

    const blockIndex = bearcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);

    res.json({ note: `Transaction is added in block ${blockIndex}.` });
})

app.get('/mine', function(req, res) {
    const lastBlock = bearcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bearcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    };

    const nonce = bearcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bearcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = bearcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    //mining reward
    bearcoin.createNewTransaction(6.25, "00", nodeAddress);


    res.json({
        note: "new block mined successfully",
        block: newBlock
    });
});



app.listen(3000, function() {
    console.log('Listening on port 3000...');

})


//http://localhost:3000/blockchain ==> display our entire chain
//http://localhost:3000/transaction ==> display an t/x
//http://localhost:3000/mine ==> convert t/x into the chain

// const bodyParser = require('body-parser');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
