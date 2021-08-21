//this is our blockchain SERVERS/DISTRIBUTED (decentral) NW: expose our blockhain f/n to the web  browser

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain.js');
const { v4: uuidv4 } = require('uuid');
const port = process.argv[2]; //accesses our port variable in our network node
const rp = require('request-promise');

const nodeAddress = uuidv4().split('-').join('');

const bearcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function(req, res) {
    res.send(bearcoin);
});

app.post('/transaction', function(req, res) {
    const newTransaction = req.body;
    const blockIndex = bearcoin.addTransactionToPendingTransactions(newTransaction); //this returns the index
    res.json({ note: `transaction will be added in block ${blockIndex} ` });

    // example code from earlier steps
    // console.log(req.body);
    // res.send(`The amount of the transaction is ${req.body.amount} bearcoin`);

    //removed after step #50 once we refactor
    // const blockIndex = bearcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    // res.json({ note: `Transaction is added in block ${blockIndex}.` });


});

app.post('/transaction/broadcast', function(req, res) {
    const newTransaction = bearcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);

    bearcoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    bearcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            res.json({ note: 'transaction created and broadcast successfully' })
        });
});

app.get('/mine', function(req, res) {
    const lastBlock = bearcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bearcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    };

    const nonce = bearcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bearcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    //this is the mining reward transaction 
    //muted here to move to broadcast portion 
    //bearcoin.createNewTransaction(6.25, "00", nodeAddress);

    const newBlock = bearcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    const requestPromises = [];

    bearcoin.networkNodes.forEach(networkNodeUrl => {
        console.log(networkNodeUrl);
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        }
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
        .then(data => {
            const requestOptions = {
                uri: bearcoin.currentNodeUrl + '/transaction/broadcast',
                method: 'POST',
                body: {
                    amount: 6.25,
                    sender: "00",
                    recipient: nodeAddress
                },
                json: true
            }
            return rp(requestOptions);
        })
        .then(data => {
            res.json({
                note: 'new block mined and broadcast successfully',
                block: newBlock
            });
        });
});

app.post('/receive-new-block', function(req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = bearcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if (correctHash && correctIndex) {
        bearcoin.chain.push(newBlock);
        bearcoin.pendingTransactions = [];
        res.json({
            note: 'new block received and accepted',
            'newBlock': newBlock
        });
    } else {
        res.json({
            note: 'new block rejected',
            newBlock: newBlock
        })
    }
});

//register a node and broadcast that node to the entire network
app.post('/register-and-broadcast-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;

    if (bearcoin.networkNodes.indexOf(newNodeUrl) == -1) bearcoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];

    bearcoin.networkNodes.forEach(networkNodeUrl => {
        //hit the register node endpoint
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        }
        regNodesPromises.push(rp(requestOptions));
    });
    Promise.all(regNodesPromises)
        .then(data => {
            //use the data
            const bulkRegisterOptions = {
                uri: newNodeUrl + '/register-nodes-bulk',
                method: 'POST',
                body: { allNetworkNodes: [...bearcoin.networkNodes, bearcoin.currentNodeUrl] },
                json: true
            }
            return rp(bulkRegisterOptions);
        })
        .then(data => {
            res.json({ note: 'new node registered with network successfully' });
        });

});

//register a node with the network
app.post('/register-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl; //take the new node url from the body
    const nodeNotAlreadyPresent = bearcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bearcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) bearcoin.networkNodes.push(newNodeUrl);
    res.json({ note: 'new node registered successfully' });
});

//register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;

    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bearcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bearcoin.currentNodeUrl !== networkNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNode) bearcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({ note: 'bulk registration successful' });
});


app.listen(port, function() {

    console.log(`Listening on port ${port} ...`);
});