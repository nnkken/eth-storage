<template>
  <div id="app">
    <div v-for="d in data" v-bind:key="d.txHash">
      {{ d.txHash }}: {{ d.data }}
    </div>
    <button :click="fetch">Refresh</button>
  </div>
</template>

<script>
import Web3 from "web3";
import { abi, address } from "./contract.js";

const FROM_BLOCK = 8300000;
const ENDPOINT = "https://mainnet.infura.io/v3/53c151ea15184dc69ea07b4d2041ba4e";

const web3 = new Web3(new Web3.providers.HttpProvider(ENDPOINT));
const Storage = new web3.eth.Contract(abi, address);

export default {
  name: "app",
  data() {
    return {
      data: [],
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    async fetch() {
      console.log("Fetching store data");
      const events = await Storage.getPastEvents("Data", {
        fromBlock: FROM_BLOCK,
        // filter: {
        //     from: FROM_ADDRESS,
        // },
      });
      console.log("Fetched");
      const result = [];
      events.forEach(e => {
        try {
          const data = e.returnValues.data;
          const obj = JSON.parse(data);
          result.push({ txHash: e.transactionHash, from: e.returnValues.from, data: obj });
        } catch (err) {
          console.error(`Error when parsing event:`, e, err);
        }
      });
      this.data = result;
    },
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
