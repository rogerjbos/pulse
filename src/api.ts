import '@polkadot/api-augment'
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");

const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const { hexToU8a, isHex } = require('@polkadot/util')


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


const getApi = async (chainName: string) => {
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

export const getIssuance = async (chain: string, mytoken: string): Promise<string>  => {

    const api = await getApi(chain);
    let issuance = api.query.tokens.totalIssuance({ Token: mytoken })
      .then((res: any) => {
          return parseInt(res, 16).toString(10);
    });
    return issuance;
}

export const getPrice = async (chain: string, block: string, mytoken: string): Promise<string>  => {
 
    const api = await getApi(chain);
    
    let hash = await api.rpc.chain.getBlockHash(parseInt(block, 10) );
    let apiAt = await api.at(hash);
    let a = await apiAt.query.acalaOracle.values({Token: mytoken});

    let b = JSON.parse(a);
    return parseInt(b.value, 16).toString();

};

export const isValidSubstrateAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
};

export const getMetadatas = async (chain: string): Promise<any> => {

  const api = await getApi(chain);
  const ent = await api.query.assetRegistry.assetMetadatas.entries();
  
  const ent2 = ent.map((asset) => {
    let h = asset[1].toHuman();
    let adj = `${h.decimals}`;
    let adj2 = 10**Number(adj);
    let mb = `${h.minimalBalance}`;
    let mb2 = Number(mb.replace(/,/gi,"").split("$").pop()) / adj2;
    let j = 
    `{"name": "${h.name}","symbol": "${h.symbol}","decimals": ${adj},"minimalBalance": ${mb2}}`;
    return j
  });
  
  return ent2;

}

