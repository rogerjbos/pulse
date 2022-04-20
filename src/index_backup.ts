//export NODE_OPTIONS="--max-old-space-size=8192"

import { Token } from "@acala-network/sdk-core";
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");

const ACALA_ENDPOINTS = [
  "wss://acala-rpc-0.aca-api.network",
  "wss://acala-rpc-1.aca-api.network",
  "wss://acala-rpc-3.aca-api.network/ws",
];

const KARURA_ENDPOINTS = [
  "wss://karura-rpc-0.aca-api.network",
  "wss://karura-rpc-1.aca-api.network",
  "wss://karura-rpc-2.aca-api.network/ws",
];

const getApi = async (chainName) => {
  let apiOptions;

  if (chainName === "acala") {
    apiOptions = options({ provider: new WsProvider(ACALA_ENDPOINTS) });
  } else if (chainName === "karura") {
    apiOptions = options({ provider: new WsProvider(KARURA_ENDPOINTS) });
  } else {
    throw "Invalid chain name";
  }

  return await ApiPromise.create(apiOptions);
};

async function getPrice(chain: string, block: string, mytoken: string): Promise<string> {
 
  const api = await getApi(chain);
  let hash = await api.rpc.chain.getBlockHash(parseInt(block, 10) );
  let apiAt = await api.at(hash);
  let a = await apiAt.query.acalaOracle.values({Token: mytoken});

  let b = JSON.parse(a);
  let price = parseInt(b.value, 16).toString();
  return price;

};

const main = async () => {
  let arg = process.argv
  const fs = require('fs');
  
  let fname = `/Users/rogerbos/subquery/price/${arg[2]}.json`
  let rawdata = fs.readFileSync(fname);
  let response = JSON.parse(rawdata);

  var count = Object.keys(response).length;
  for (let i = 0; i < count; i++) {
    if (response[i].oracle === "0") {
      console.log(`working on ${i}`);
      try
      {
          response[i].oracle = await getPrice(response[i].chain.toLowerCase(), response[i].block.toString(), response[i].mytoken);
          let data = JSON.stringify(response);
          fs.writeFileSync(fname, data);
      }
      catch
      {
        console.log(`problem with ${i}`);
      }
    }
  }
}
main().catch(e => console.error(e)).finally(() => process.exit(0))