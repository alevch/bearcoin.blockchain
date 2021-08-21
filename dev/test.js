const Blockchain = require('./blockchain.js');

const bearcoin = new Blockchain(); //makes a new instance (or Brand) of our blockchain data structure (module)

// console.log(bearcoin);

//remember .createNewBlock() needs these 3 parameters: nonce, previousBlockHash, hash
bearcoin.createNewBlock(12342, 'Q340NAPGAGB', 'AAJABJSABBOB0');
bearcoin.createNewBlock(5365, 'UJJAGJIAJIAD', 'PAJJDKJJJJ');
bearcoin.createNewBlock(8676, 'GYYY899UB0A9', 'ZJJPAJPOGOIOI');

bearcoin.createNewTransaction(100, 'SEND9AB8AJBAPDI', 'RECAOIJBAB0SSA');
bearcoin.createNewTransaction(20, 'ND9AB8ASDFASBAPDI', 'AGABRECAOIJBAB0SSA');
bearcoin.createNewTransaction(1, 'SEND9AB8AJBAPDI', 'SEND9AB8AJBAPDI');
bearcoin.createNewTransaction(17, 'SENDB8AJBAPDI', 'RECAOIJBAB0SSA');

const previousBlockHash = 'A9089AUD8A8UA8GSDA';
const currentBlockData = [{
        "amount": 50,
        "sender": "ALEX00IIO99GHAHBA1",
        "recipient": "RODRIGOOOIJOI9ABAABAS1",
    },
    {
        "amount": 150,
        "sender": "ALEX00IIO99GHAHBA2",
        "recipient": "RODRIGOOOIJOI9ABAABAS2",
    },
    {
        "amount": 5,
        "sender": "ALEX00IIO99GHAHBA3",
        "recipient": "RODRIGOOOIJOI9ABAABAS3",
    }
];
// const nonce = 100;


let nonce = bearcoin.proofOfWork(previousBlockHash, currentBlockData);
console.log('nonce from Proof of Work : ' + nonce);

console.log(bearcoin.hashBlock(previousBlockHash, currentBlockData, nonce));

console.log(bearcoin);

// console.log(bearcoin.newTransactions[bearcoin.newTransactions.length - 1]);