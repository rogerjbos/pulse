const api = require('../api')
const subql = require('../subql')
const subscan = require('../subscan')
import { ApiPromise, WsProvider } from '@polkadot/api';
const fs = require("fs");
const DF = require('data-forge');
require('data-forge-fs');


const main = async () => {
  
  const chain: any = 'acala';
  var crowdloanGeckoId: string;
  var crowdloanDecimals: number;
  var chainID: number;// acala=10; karura=10; substrate=42
  var api_url: string;
  switch(chain) {
      case "acala": {
        crowdloanGeckoId = "polkadot";
        crowdloanDecimals = 10;
        chainID = 10;
        api_url = 'wss://rpc.polkadot.io';
        break;
      }
      default: {
        crowdloanGeckoId = "kusama";
        crowdloanDecimals = 12;
        chainID = 8;
        api_url = 'wss://kusama-rpc.polkadot.io';
      }
  }

  const wsProvider2 = new WsProvider(api_url);
  const api2 = await ApiPromise.create({ provider: wsProvider2 });
  const { Keyring } = require("@polkadot/keyring");
  const keyring = new Keyring();
  // require('data-forge-plot');
  // require('@data-forge-plot/render');
  const fname = `/Users/rogerbos/R_HOME/karura-reports/${chain}_email.csv`;
  const addr = fs.readFileSync(fname, { encoding: "utf-8" });
  const addr2 = DF.fromCSV(addr);

  const getBalance = async (addr): Promise<any> => {
    const data = await api2.query.system.account(addr);
    return data['data']['free'];
  }
  
  let address = addr2.getSeries("address").head(5).toArray();
  
  var bal:any[] = new Array(address.length); 
  for(let i = 0; i < address.length; i++) {
    bal[i] = await getBalance(address[i]);
    console.log(`${i} has ${address[i]} balance ${bal[i]}`)
  }
  const addresses = addr2.generateSeries({
    accountId: row => keyring.encodeAddress(row.address, chainID),
  })
  const bal2 = new DF.Series(bal);
  const withBalance = addresses.withSeries({Balance: bal2}) / 10**crowdloanDecimals;

  // withBalance.asCSV()                     
  //   .writeFileSync(`/Users/rogerbos/R_HOME/karura-reports/${chain}_email_balance.csv`);


}
main().catch(e => console.error(e)).finally(() => process.exit(0))