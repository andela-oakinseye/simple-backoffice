# simple-backoffice
Simple backoffice server

## Test server to make testing easier
### Wallets BTC, USD, EUR are automatically created for users on signup

## Endpoints

## Create a User
**POST** `localhost:3000/user`

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


### Withdraw funds from User's Wallet
**POST** `localhost:3000/withdraw/<USER_ID>`
```json
{
  "currency": "USD",
  "amount": 10
}
```