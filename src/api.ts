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

export const getMetadatas = async (chain: string): Promise<any> => {

  const api = await getApi(chain);
  const ent = await api.query.assetRegistry.assetMetadatas.entries();

  let b, mb, adj;
  var out = "[";  
  ent.forEach(([{ args: [asset] }, value]:any) => {

    // format id
    b = JSON.stringify(asset)
    if (b.search('nativeAssetId') > 0) {
      b = asset.value.toHuman().Token;
    } else if (b.search('stableAssetId') > 0) {
      b = "sa://" + asset.value.toHuman();
    } else if (b.search('foreignAssetId') > 0) {
      b = "fa://" + asset.value.toHuman();
    } else {
      b = "erc20://" + asset.value.toHuman();
    }

    // convert minimalBalance to a number
    adj = `${value.toHuman().decimals}`;
    adj = 10**Number(adj);
    mb = `${value.toHuman().minimalBalance}`;
    mb = Number(mb.replace(/,/gi,"")) / adj;
    
    out += `{"id": "${b}", 
      "name": "${value.toHuman().name}", 
      "symbol": "${value.toHuman().symbol}", 
      "decimals": ${value.toHuman().decimals},
      "minimalBalance": ${mb}},
      `;
  });
  out += "{}]";

  let outj = JSON.parse(out);  
  return outj;

}

// ent.map(([{ args: [asset]}, value]) => ({ name: value.toHuman().name })