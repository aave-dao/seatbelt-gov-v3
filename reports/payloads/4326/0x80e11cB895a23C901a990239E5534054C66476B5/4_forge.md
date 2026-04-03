## Reserve changes

### Reserves altered

#### WETH ([0x4200000000000000000000000000000000000006](https://megaeth.blockscout.com/address/0x4200000000000000000000000000000000000006))

| description | value before | value after |
| --- | --- | --- |
| usageAsCollateralEnabled | :x: | :white_check_mark: |
| ltv | 0 % [0] | 78 % [7800] |
| liquidationThreshold | 0 % [0] | 81 % [8100] |
| liquidationBonus | 0 % | 5.5 % [10550] |


#### wstETH ([0x601aC63637933D88285A025C685AC4e9a92a98dA](https://megaeth.blockscout.com/address/0x601aC63637933D88285A025C685AC4e9a92a98dA))

| description | value before | value after |
| --- | --- | --- |
| usageAsCollateralEnabled | :x: | :white_check_mark: |
| ltv | 0 % [0] | 75 % [7500] |
| liquidationThreshold | 0 % [0] | 79 % [7900] |
| liquidationBonus | 0 % | 6.5 % [10650] |


#### BTC.b ([0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072](https://megaeth.blockscout.com/address/0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072))

| description | value before | value after |
| --- | --- | --- |
| usageAsCollateralEnabled | :x: | :white_check_mark: |
| ltv | 0 % [0] | 68 % [6800] |
| liquidationThreshold | 0 % [0] | 73 % [7300] |
| liquidationBonus | 0 % | 6.5 % [10650] |


## EMode changes

### EMode: wstETH Stablecoins (id: 3)

| description | value before | value after |
| --- | --- | --- |
| ltv | 75 % | 78.5 % |
| liquidationThreshold | 79 % | 81 % |


## Raw diff

```json
{
  "eModes": {
    "3": {
      "liquidationThreshold": {
        "from": 7900,
        "to": 8100
      },
      "ltv": {
        "from": 7500,
        "to": 7850
      }
    }
  },
  "reserves": {
    "0x4200000000000000000000000000000000000006": {
      "liquidationBonus": {
        "from": 0,
        "to": 10550
      },
      "liquidationThreshold": {
        "from": 0,
        "to": 8100
      },
      "ltv": {
        "from": 0,
        "to": 7800
      },
      "usageAsCollateralEnabled": {
        "from": false,
        "to": true
      }
    },
    "0x601aC63637933D88285A025C685AC4e9a92a98dA": {
      "liquidationBonus": {
        "from": 0,
        "to": 10650
      },
      "liquidationThreshold": {
        "from": 0,
        "to": 7900
      },
      "ltv": {
        "from": 0,
        "to": 7500
      },
      "usageAsCollateralEnabled": {
        "from": false,
        "to": true
      }
    },
    "0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072": {
      "liquidationBonus": {
        "from": 0,
        "to": 10650
      },
      "liquidationThreshold": {
        "from": 0,
        "to": 7300
      },
      "ltv": {
        "from": 0,
        "to": 6800
      },
      "usageAsCollateralEnabled": {
        "from": false,
        "to": true
      }
    }
  }
}
```
