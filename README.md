# simple-backoffice
Simple backoffice server

## Test server to make testing easier
### Wallets BTC, USD, EUR are automatically created for users on signup

## Endpoints

## Create a User
**POST** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/user`
```json
{
  "firstname": "Olawale",
  "lastname": "Akinseye"
}
```

**Response**
```json
{
	"success": true,
	"user": {
		"_id": "5b15871c31f02c3aa48d060d",
		"firstname": "Olawale",
		"lastname": "Akinseye",
		"__v": 0
	},
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMTU4NzFjMzFmMDJjM2FhNDhkMDYwZCIsInVzZXJuYW1lIjoiNWIxNTg3MWMzMWYwMmMzYWE0OGQwNjBkQHNpbXBsZWJhY2tvZmZpY2UuY29tIiwiaWF0IjoxNTI4MTM3NTAxfQ.165JA-TqFE6UYc5PIq7CJ-ri-Mu_vGqvuFZk5zpIRn8",
	"wallets": [
		{
			"balance": 1,
			"_id": "5b15871c31f02c3aa48d060e",
			"user_id": "5b15871c31f02c3aa48d060d",
			"currency": "BTC",
			"__v": 0
		},
		{
			"balance": 1,
			"_id": "5b15871c31f02c3aa48d060f",
			"user_id": "5b15871c31f02c3aa48d060d",
			"currency": "USD",
			"__v": 0
		},
		{
			"balance": 1,
			"_id": "5b15871c31f02c3aa48d0610",
			"user_id": "5b15871c31f02c3aa48d060d",
			"currency": "EUR",
			"__v": 0
		}
	]
}
```

## Decode a Token
**GET** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/backend/jwtDecode?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMTU4NTg3YWNjNWU4M2E4NDUyMTg3MCIsInVzZXJuYW1lIjoiNWIxNTg1ODdhY2M1ZTgzYTg0NTIxODcwQHNpbXBsZWJhY2tvZmZpY2UuY29tIiwiaWF0IjoxNTI4MTM3MDk1fQ.NQnFsA7Teoj3EUpgPXOAPqEJIz2wOQC5pkr5ERpp87w`

**Response**
```json
{
	"data": {
		"id": "5b158587acc5e83a84521870",
		"username": "5b158587acc5e83a84521870@simplebackoffice.com",
		"iat": 1528137095
	},
	"response": {
		"code": 200
	}
}
```


## Get all Balances
**GET** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/balances`

**GET** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/balances?checksum=127928282`

**Response**
```json
{
	"checksum": -926698557,
	"balance": [
		[
			"5b1108ae079f425343c715b8",
			{
				"BTC": 72100,
				"USD": 1,
				"EUR": 1
			}
		],
		[
			"5b112b79ded7f95f87f84bef",
			{
				"BTC": 81,
				"USD": 1,
				"EUR": 1
			}
    ]
  ]
}
```

## Get Checksum of all Balances [DEPRECATED]
### <Checksum will now be sent with the balance object ^^>
**GET** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/balances/checksum`

**Response**
```json
{
	"success": true,
	"checksum": -1705212599
}
```


## Deposit into a User's Wallet
**POST** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/deposit/<USER_ID>`
```json
{
  "currency": "BTC",
  "amount": 0.2
}
```

**Response**
```json
{
	"success": true,
	"wallet": {
		"balance": 29,
		"_id": "5b150e8b1c05b30e5b5abf8d",
		"user_id": "5b150e8a1c05b30e5b5abf8c",
		"currency": "BTC",
		"__v": 0
	}
}
```


## Withdraw funds from User's Wallet
**POST** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/withdraw/<USER_ID>`
```json
{
  "currency": "USD",
  "amount": 10
}
```

**Response**
```json
{
	"success": true,
	"wallet": {
		"balance": 23,
		"_id": "5b150e8b1c05b30e5b5abf8d",
		"user_id": "5b150e8a1c05b30e5b5abf8c",
		"currency": "BTC",
		"__v": 0
	}
}
```

## Process acknowledgment message of an exchange from core ms
**POST** `simplebackoffice-env.kvus2ffkxa.eu-west-2.elasticbeanstalk.com/exchange`
```json
{
  "exchange": { "exchangeUserData1": { "userID": "5b112b79ded7f95f87f84bef", "orderID": "ORDER_015", "currency": "BTC", "qty": "10" }, "exchangeUserData2": { "userID": "5b1108ae079f425343c715b8", "orderID": "ORDER_019", "currency": "USD", "qty": "9000" } }
}
```

**Response**
```json
{
	"success": true,
	"clearMargin": {
		"user1": {
			"userID": "5b112b79ded7f95f87f84bef",
			"currency": "USD",
			"qty": "9000"
		},
		"user2": {
			"userID": "5b1108ae079f425343c715b8",
			"currency": "BTC",
			"qty": "10"
		}
	}
}
```

