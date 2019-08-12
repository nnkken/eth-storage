module.exports = {
    ETH_ENDPOINT: "https://cloudflare-eth.com", // Ethereum endpoint, should not need to change
    ETH_PRIVKEY: "0x0000000000000000000000000000000000000000000000000000000000000000", // Your Ethereum private key, for providing Ethereum transaction fee
    CONTRACT_ADDRESS: "0xA0e0F7f26842B319EE6580f1A903F5D06E9F5bDC", // Don't need to change this unless you deployed another Ethereum contract
    IPFS_ENDPOINT: [
        "localhost", "5001", { protocol: "http" } // IPFS gateway for uploading IPFS and IPLD content
    ]
};