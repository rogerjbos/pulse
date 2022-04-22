function main() {

  var tiny = require('tiny-json-http');
  var url = 'https://api.subquery.network/sq/AcalaNetwork/karura-tokens';
  var data = '{"query": "{accountBalances (first: 5) {nodes{id accountId tokenId total}}}"}';
  
  tiny.post({url, data}, function __posted(err: any, result: any) {
    if (err) {
      console.log(err)
    } else {
      console.log(result)
    }
  });
}
main()
