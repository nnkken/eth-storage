const util = require("util");
const fs = require("fs");
const yaml = require("yaml");
const ipfsClient = require("ipfs-http-client")
const Web3 = require("web3");
const {
    ETH_ENDPOINT,
    ETH_PRIVKEY,
    CONTRACT_ADDRESS,
    IPFS_ENDPOINT,
} = require("./config.js");

const readFile = util.promisify(fs.readFile);

const ipfs = ipfsClient(...IPFS_ENDPOINT);

const CONTRACT_ABI = [{"constant":false,"inputs":[{"name":"data","type":"string"}],"name":"store","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"data","type":"string"}],"name":"Data","type":"event"}];

const web3 = new Web3(new Web3.providers.HttpProvider(ETH_ENDPOINT));
const Storage = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

function sendTransaction(rawTransaction) {
    return new Promise((resolve, reject) => web3.eth.sendSignedTransaction(rawTransaction)
        .once("transactionHash", resolve)
        .on("error", reject)
    );
}

async function ethUpload(data) {
    if (typeof data !== "string") {
        data = JSON.stringify(data);
    }
    const { address: from, signTransaction } = web3.eth.accounts.privateKeyToAccount(ETH_PRIVKEY);
    const call = Storage.methods.store(data);
    const callData = call.encodeABI();
    const gas = await call.estimateGas({ from });
    const signedTx = await signTransaction({
        to: CONTRACT_ADDRESS,
        data: callData,
        gas: Math.floor(gas * 1.5),
    });
    return sendTransaction(signedTx.rawTransaction);
}

async function metadataToIpfsAndIpld(input) {
    const path = `./input/${input.filename}`;
    console.log(`Reading ${path}`);
    const content = await readFile(path)
    console.log(`Adding ${path} onto IPFS`);
    const ipfsResult = await ipfs.add(content);
    const ipfsHash = ipfsResult[0].hash;
    input.ipfs = ipfsHash;
    console.log(`${path} added onto IPFS, hash: ${ipfsHash}`);
    console.log(`Putting metadata for ${path} onto IPLD`);
    const ipld = await ipfs.dag.put(input, {
        format: "dag-cbor",
        hashAlg: "sha2-256",
    });
    const ipldHash = ipld.toBaseEncodedString();
    console.log(`Metadata for ${path} put onto IPLD, hash: ${ipldHash}`);
    return ipldHash;
}

async function main() {
    const inputRawData = fs.readFileSync("./input/input.yaml", "utf-8");
    const metadataArray = yaml.parse(inputRawData);
    const ipldHashes = await Promise.all(metadataArray.map(metadataToIpfsAndIpld));
    const txHash = await ethUpload(ipldHashes);
    console.log(txHash);
}

main();