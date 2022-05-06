const api = require('../api')
const subql = require('../subql')
const subscan = require('../subscan')
const axios = require('axios');


const main = async () => {
  
  const chain: any = 'karura';

  // const transactions_sq = await subql.getTransactions(chain.toLowerCase());
  // console.table("transactions: " + transactions_sq);

  // const accounts_sq = await subql.getAccounts(chain.toLowerCase());
  // console.table("accounts: " + accounts_sq);

  // const accounts_subscan = await subscan.getAccounts(chain.toLowerCase());
  // console.table("accounts subscan: " + accounts_subscan);

  // const issuance = await api.getIssuance(chain.toLowerCase(), "KSM");
  // console.log("KSM issuance: " + issuance / 10**10);

  // const poolsStats = await subql.getPoolsStats(chain.toLowerCase());
  // console.table(poolsStats);

  // const poolsDex = await subql.getPoolsDex(chain.toLowerCase());
  // console.table(poolsDex);

  // const mint = await subql.getMint(chain.toLowerCase());
  // console.table(mint);

  const dexTVL = await subql.getDexTVL(chain.toLowerCase());
  console.table(dexTVL);

  var id: string;
  switch(chain) {
      case "acala": {
        id = "polkadot";
        break;
      }
      default: {
          id = "kusama";
      }
  }
  const crowdloanPrice = await subscan.getPrice(id);
  console.log(id + " price: " + crowdloanPrice);
  const KSM_Crowdloan_TVL = crowdloanPrice * Number("501137661910050505") / 10**12

  


//   // Total_Dex_TVL=totalDexTvl
//   const Total_Dex_TVL = cum_dex_TVL[cum_dex_TVL.length-1].Cum_TVL
//   const Total_Pool_TVL = cum_pool_TVL[cum_pool_TVL.length-1].Cum_TVL
//   // console.log("cumTVL: " + cumTVL[cumTVL.length-1].Total_TVL);


//   // Get id from table of tokens sorted by TVL
//   function getId(Id) {
//     var found = null;
//     for (var i = 0; i < cum_dex_TVL.length; i++) {
//       var element = cum_dex_TVL[i];
//       if (element.id == Id) {
//         found = element;
//       }
//     }
//     return found;
//   }




  ///////////////////////////////////
  // const block = 1841000;
  // const mytoken = "KSM";
  // const res = await api.getPrice(chain.toLowerCase(), block.toString(), mytoken);
  // const price = Number(res) / 10**18;
  // console.log(`Price of ${mytoken} on block ${block} was ${price}.`);

  // const meta = await api.getMetadatas(chain.toLowerCase());
  // console.table(meta);

}
main().catch(e => console.error(e)).finally(() => process.exit(0))