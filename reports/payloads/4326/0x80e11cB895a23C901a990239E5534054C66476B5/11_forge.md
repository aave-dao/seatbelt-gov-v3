## Reserve changes

### Reserves altered

#### ezETH ([0x09601A65e7de7BC8A19813D263dD9E98bFdC3c57](https://mega.etherscan.io/address/0x09601A65e7de7BC8A19813D263dD9E98bFdC3c57))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |


#### USDT0 ([0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb](https://mega.etherscan.io/address/0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 10,000,000 USDT0 | 1 USDT0 |
| borrowCap | 9,000,000 USDT0 | 1 USDT0 |
| reserveFactor | 10 % [1000] | 50 % [5000] |


## Raw diff

```json
{
  "reserves": {
    "0x09601A65e7de7BC8A19813D263dD9E98bFdC3c57": {
      "isFrozen": {
        "from": false,
        "to": true
      }
    },
    "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb": {
      "borrowCap": {
        "from": 9000000,
        "to": 1
      },
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 1000,
        "to": 5000
      },
      "supplyCap": {
        "from": 10000000,
        "to": 1
      }
    }
  }
}
```
