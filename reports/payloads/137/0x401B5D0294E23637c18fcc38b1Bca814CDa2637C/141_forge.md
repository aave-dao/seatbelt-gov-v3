## Reserve changes

### Reserves altered

#### USDC ([0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


#### DAI ([0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063](https://polygonscan.com/address/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


#### EURS ([0xE111178A87A3BFf0c8d18DECBa5798827539Ae99](https://polygonscan.com/address/0xE111178A87A3BFf0c8d18DECBa5798827539Ae99))

| description | value before | value after |
| --- | --- | --- |
| debtCeiling | 1 $ [100] | 0 $ [0] |


#### miMATIC ([0xa3Fa99A148fA48D14Ed51d610c367C61876997F1](https://polygonscan.com/address/0xa3Fa99A148fA48D14Ed51d610c367C61876997F1))

| description | value before | value after |
| --- | --- | --- |
| debtCeiling | 180,000 $ [18000000] | 0 $ [0] |


#### USDT0 ([0xc2132D05D31c914a87C6611C10748AEb04B58e8F](https://polygonscan.com/address/0xc2132D05D31c914a87C6611C10748AEb04B58e8F))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


## Raw diff

```json
{
  "reserves": {
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    },
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    },
    "0xE111178A87A3BFf0c8d18DECBa5798827539Ae99": {
      "debtCeiling": {
        "from": 100,
        "to": 0
      }
    },
    "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1": {
      "debtCeiling": {
        "from": 18000000,
        "to": 0
      }
    },
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    }
  }
}
```
