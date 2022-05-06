import { request, gql } from 'graphql-request'

const ACALA_SUBQL_DEX = "https://api.subquery.network/sq/AcalaNetwork/acala-dex";
const ACALA_SUBQL_HOMA = "https://api.subquery.network/sq/AcalaNetwork/acala-homa";
const ACALA_SUBQL = "https://api.subquery.network/sq/AcalaNetwork/acala";
// export const ACALA_CROWDLOAN_AMOUNT = "" //'), priceObj['DOT']);
// export const ACALA_STABLE_TOKEN = "AUSD";
// export const ACALA_NATIVE_TOKEN = "ACA";

const KARURA_SUBQL_DEX = "https://api.subquery.network/sq/AcalaNetwork/karura-dex";
const KARURA_SUBQL_HOMA = "https://api.subquery.network/sq/AcalaNetwork/karura-homa";
const KARURA_SUBQL = "https://api.subquery.network/sq/AcalaNetwork/karura";
// export const KARURA_CROWDLOAN_AMOUNT = "501137661910050505" //'), priceObj['KSM']);
// export const KARURA_STABLE_TOKEN = "KUSD";
// export const KARURA_NATIVE_TOKEN = "KAR";

export const toFloat = (x: string) => {
  return Number(x) / 1e18;
}

export const fixToken = (x: string) => {
    var y = x.replace('fa://0', 'RMRK')
              .replace('fa%3A%2F%2F0', 'RMRK')
              .replace('fa://1', 'ARIS')
              .replace('fa%3A%2F%2F1', 'ARIS')
              .replace('fa://2', 'QTZ')
              .replace('fa%3A%2F%2F2', 'QTZ')
              .replace('fa://3', 'MOVRZ')
              .replace('fa%3A%2F%2F3', 'MOVR')
              .replace('fa://4', 'HKO')
              .replace('fa%3A%2F%2F4', 'HKO')
              .replace('fa://5', 'CSM')
              .replace('fa%3A%2F%2F5', 'CSM')
              .replace('lc://13', 'LCDOT')
              .replace('sa://0', 'taiKSM')
              .replace('sa%3A%2F%2F0', 'taiKSM')
              .replace('lc%3A%2F%2F13', 'LCDOT')
    return y;
}

// Helper to sort JSON object based on 'prop'
const GetSortOrder = (prop: any) => {
    return function(a: any, b: any) {
        if (a[prop] > b[prop]) {
            return -1;
        } else if (a[prop] < b[prop]) {
            return 1;
        }
        return 0;
    }
}

export const getTransactions = async (chain: string): Promise<any> => {
    var api_endpoint;
    switch(chain) {
        case "acala": {
          api_endpoint = ACALA_SUBQL;
          break;
        }
        default: {
           api_endpoint = KARURA_SUBQL;
        }
    }
    const QUERY_extrinsics = gql`query { extrinsics { totalCount } }`;
    const extrinsics = await request(api_endpoint, QUERY_extrinsics, {});
    return extrinsics.extrinsics.totalCount;

}

export const getAccounts = async (chain: string): Promise<any> => {
    var api_endpoint;
    switch(chain) {
        case "acala": {
          api_endpoint = ACALA_SUBQL;
          break;
        }
        default: {
           api_endpoint = KARURA_SUBQL;
        }
    }
    const QUERY_accounts = gql`query { accounts { totalCount } }`;
    const accounts = await request(api_endpoint, QUERY_accounts, {});
    return  accounts.accounts.totalCount;
}
  
export const getPoolsStats = async (chain: string): Promise<any> => {
    var api_endpoint;
    switch(chain) {
        case "acala": {
          api_endpoint = ACALA_SUBQL;
          break;
        }
        default: {
           api_endpoint = KARURA_SUBQL;
        }
    }
    const QUERY_poolsByToken = gql`
    query Pool {
        pools {
            nodes {
                id,
                token0 {decimal, name}
                token1 {decimal, name}
                token0Amount
                token1Amount
                tvlUSD
                dayData(orderBy:DATE_DESC,first:7) {
                    nodes {
                        date
                        tvlUSD
                        volumeUSD
                    }
                }
            }
        }
    }
    `;
    const pooltest = await request(api_endpoint, QUERY_poolsByToken, { });
    const pools = pooltest.pools.nodes;
 
    interface pool_stats {
        pool?: string;
        TVL?: number;
        volumeUSD_24H?: number;
        volumeUSD_7D?: number;
    }

    var tmp;
    for (let j = 0; j < pools.length; j++) {
        pools[j].id = fixToken(pools[j].id);
        tmp = pools[j].dayData.nodes
        var acc: number = 0;
        for (let jj = 0; jj < tmp.length; jj++) {
            acc = acc + Number(tmp[jj].volumeUSD) / 10**18 || 0
            if (jj == 0) {
                pools[j].volumeUSD_24H = acc;
            }
        }
        pools[j].volumeUSD_7D = acc

    }
    return pools;
}
    
export const getMint = async (chain: string): Promise<any> => {
    var api_endpoint;
    switch(chain) {
        case "acala": {
          api_endpoint = ACALA_SUBQL_HOMA;
          break;
        }
        default: {
           api_endpoint = KARURA_SUBQL_HOMA;
        }
    }
    const QUERY_mint = gql`query { mints { nodes { id type amountStaked amountMinted stakingCurrencyAmount liquidAmountReceived liquidAmountAddedToVoid }}}`;
    const mint = await request(api_endpoint, QUERY_mint, { });
    var mint_data = mint.mints.nodes
    // console.log("mint: " + JSON.stringify(mint_data));
    for (var i = 0; i < mint_data.length; i++) {
        mint_data[i].id = mint_data[i].id.substring(0, 5);
        mint_data[i].amountStaked = Number(mint_data[i].amountStaked) / 10**12;
        mint_data[i].amountMinted = Number(mint_data[i].amountMinted) / 10**12;
        mint_data[i].stakingCurrencyAmount = Number(mint_data[i].stakingCurrencyAmount) / 10**12;
        mint_data[i].liquidAmountReceived = Number(mint_data[i].liquidAmountReceived) / 10**12;
        mint_data[i].liquidAmountAddedToVoid = Number(mint_data[i].liquidAmountAddedToVoid) / 10**12;
    }
    return mint_data;
}

export const getPoolsDex = async (chain: string): Promise<any> => {
    var api_endpoint;
    switch(chain) {
        case "acala": {
            api_endpoint = ACALA_SUBQL_DEX;
            break;
        }
        default: {
            api_endpoint = KARURA_SUBQL_DEX;
        }
    }
  const QUERY_pool = gql`query { pools { nodes { id feeRate txCount tradeVolumeUSD totalTVL }}}`;
  const pool_tvl = await request(api_endpoint, QUERY_pool, { });
  var pools_data = pool_tvl.pools.nodes

  for (var i = 0; i < pools_data.length; i++) {
    pools_data[i].id = fixToken(pools_data[i].id);
    pools_data[i].feeRate = Number(pools_data[i].feeRate);
    pools_data[i].tradeVolumeUSD = toFloat(pools_data[i].tradeVolumeUSD);
    pools_data[i].totalTVL = toFloat(pools_data[i].totalTVL);
  }
  
  const pools_sorted = pools_data.sort(GetSortOrder("totalTVL"));
    //   console.log("pools: " + JSON.stringify(pools_sorted));
    // let cumsum_pool = 0;
    // const cum_pool_TVL = poolsDex.map(({id: string, tradeVolumeUSD: number, totalTVL: number}) =>
    //   ({id, tradeVolumeUSD, totalTVL, Cum_TVL: cumsum_pool = cumsum_pool + totalTVL }));
      
  return pools_sorted;
}


export const getDexTVL = async (chain: string): Promise<any> => {

    var api_endpoint;
    switch(chain) {
        case "acala": {
            api_endpoint = ACALA_SUBQL_DEX;
            break;
        }
        default: {
            api_endpoint = KARURA_SUBQL_DEX;
        }
    }
  const QUERY_tvl = gql`query MyTokenQ { tokens (filter: {tvl: {greaterThan: "0"}})
    { nodes { id amount tradeVolumeUSD tvl price decimals }}}`;
  const all_dex_tvl = await request(api_endpoint, QUERY_tvl, { });
  var tvl_data = all_dex_tvl.tokens.nodes

  for (var i = 0; i < tvl_data.length; i++) {
    tvl_data[i].id = fixToken(tvl_data[i].id);
    tvl_data[i].tradeVolumeUSD = toFloat(tvl_data[i].tradeVolumeUSD);
    tvl_data[i].tvl = toFloat(tvl_data[i].tvl);
    tvl_data[i].price = toFloat(tvl_data[i].price);
    tvl_data[i].adj = 10**tvl_data[i].decimals;
    tvl_data[i].amount = Number(tvl_data[i].amount) / tvl_data[i].adj;
  }

  var dex_sorted = tvl_data.sort(GetSortOrder("tvl"));
  // console.log("tvl_data:" + JSON.stringify(tvl_data));
//   let cumsum = 0;
//   const cum_dex_TVL = dex_sorted.map(({id, tradeVolumeUSD, tvl}) =>
//     ({id, tradeVolumeUSD, tvl, Cum_TVL: cumsum += tvl }));

  return dex_sorted;
}
