const newLocal = require('axios');
const axios = newLocal;

export const getPrice = async (id: string): Promise<any> => {

    const price = await axios({
        method: 'get',
        url: `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
        header: 'Content-Type: application/json'})
        .then(function (response: any) {
          return response.data[id].usd;
    });
    return price;

}

// acala-pulse creates an API with 3 queries to get the number of accounts
export const getAccounts = async (chain: string): Promise<any> => {
    var url;
    switch(chain) {
        case "acala": {
          url = 'https://acala.api.subscan.io/api/scan/accounts';
          break;
        }
        default: {
           url = 'https://karura.api.subscan.io/api/scan/accounts';
        }
    }
    const accountHolderCount = await axios({
        method: 'post',
        url: url,
        header: 'Content-Type: application/json',
        data: '{"row": 1, "page": 1}'})
        .then(function (response: any) {
            return response.data.data.count;
    });
    return accountHolderCount;
}

