## Reserve changes

### Reserves altered

#### LINK.e ([0x5947BB275c521040051D82396192181b413227A3](https://snowscan.xyz/address/0x5947BB275c521040051D82396192181b413227A3))

| description | value before | value after |
| --- | --- | --- |
| borrowCap | 45,000 LINK.e | 1 LINK.e |
| ltv | 66 % [6600] | 0 % [0] |
| borrowingEnabled | :white_check_mark: | :x: |


#### AAVE.e ([0x63a72806098Bd3D9520cC43356dD78afe5D386D9](https://snowscan.xyz/address/0x63a72806098Bd3D9520cC43356dD78afe5D386D9))

| description | value before | value after |
| --- | --- | --- |
| ltv | 63 % [6300] | 0 % [0] |


#### wrsETH ([0x7bFd4CA2a6Cf3A3fDDd645D10B323031afe47FF0](https://snowscan.xyz/address/0x7bFd4CA2a6Cf3A3fDDd645D10B323031afe47FF0))

| description | value before | value after |
| --- | --- | --- |
| ltv | 0.05 % [5] | 0 % [0] |


#### EURC ([0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD](https://snowscan.xyz/address/0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD))

| description | value before | value after |
| --- | --- | --- |
| ltv | 75 % [7500] | 0 % [0] |


## EMode changes

### EMode: EURC__USDC_USDT (id: 6)

| description | value before | value after |
| --- | --- | --- |
| label | - | EURC__USDC_USDT |
| ltv | - | 75 % |
| liquidationThreshold | - | 78 % |
| liquidationBonus | - | 5 % [10500] |
| borrowableBitmap | - | USDC, USDt |
| collateralBitmap | - | EURC |


## Raw diff

```json
{
  "eModes": {
    "6": {
      "from": null,
      "to": {
        "borrowableBitmap": "36",
        "collateralBitmap": "16384",
        "eModeCategory": 6,
        "label": "EURC__USDC_USDT",
        "liquidationBonus": 10500,
        "liquidationThreshold": 7800,
        "ltv": 7500
      }
    }
  },
  "reserves": {
    "0x5947BB275c521040051D82396192181b413227A3": {
      "borrowCap": {
        "from": 45000,
        "to": 1
      },
      "borrowingEnabled": {
        "from": true,
        "to": false
      },
      "ltv": {
        "from": 6600,
        "to": 0
      }
    },
    "0x63a72806098Bd3D9520cC43356dD78afe5D386D9": {
      "ltv": {
        "from": 6300,
        "to": 0
      }
    },
    "0x7bFd4CA2a6Cf3A3fDDd645D10B323031afe47FF0": {
      "ltv": {
        "from": 5,
        "to": 0
      }
    },
    "0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD": {
      "ltv": {
        "from": 7500,
        "to": 0
      }
    }
  }
}
```
