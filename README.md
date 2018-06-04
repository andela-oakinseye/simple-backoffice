# simple-backoffice
Simple backoffice server

## Test server to make testing easier
### Wallets BTC, USD, EUR are automatically created for users on signup

## Endpoints

## Create a User
**POST** `localhost:3000/user`
```json
{
  "firstname": "Olawale",
  "lastname": "Akinseye"
}
```

## Get all Balances
**GET** `localhost:3000/balances`

## Get Checksum of all Balances
**GET** `localhost:3000/balances/checksum`


## Deposit into a User's Wallet
**POST** `localhost:3000/deposit/<USER_ID>`
```json
{
  "currency": "BTC",
  "amount": 0.2
}
```


## Withdraw funds from User's Wallet
**POST** `localhost:3000/withdraw/<USER_ID>`
```json
{
  "currency": "USD",
  "amount": 10
}
```

## Process acknowledgment message of an exchange from core ms
**POST** `localhost:3000/exchange`
```json
{
  "exchange": { "exchangeUserData1": { "userID": "5b112b79ded7f95f87f84bef", "orderID": "ORDER_015", "currency": "BTC", "qty": "10" }, "exchangeUserData2": { "userID": "5b1108ae079f425343c715b8", "orderID": "ORDER_019", "currency": "USD", "qty": "9000" } }
}
```



### WS route for exchange backoffice communication
`ws://localhost:3000/exchange`