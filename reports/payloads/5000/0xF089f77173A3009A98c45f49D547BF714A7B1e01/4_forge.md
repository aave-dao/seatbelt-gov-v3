## Reserve changes

### Reserves altered

#### USDC ([0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9](https://mantlescan.xyz//address/0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


#### USDe ([0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34](https://mantlescan.xyz//address/0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


#### USDT0 ([0x779Ded0c9e1022225f8E0630b35a9b54bE713736](https://mantlescan.xyz//address/0x779Ded0c9e1022225f8E0630b35a9b54bE713736))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


#### WMNT ([0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8](https://mantlescan.xyz//address/0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8))

| description | value before | value after |
| --- | --- | --- |
| debtCeiling | 2,000,000 $ [200000000] | 0 $ [0] |


#### WETH ([0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111](https://mantlescan.xyz//address/0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111))

| description | value before | value after |
| --- | --- | --- |
| debtCeiling | 30,000,000 $ [3000000000] | 0 $ [0] |


#### GHO ([0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73](https://mantlescan.xyz//address/0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


## Pool config changes

| description | value before | value after |
| --- | --- | --- |
| priceOracleSentinel | [0x64df9D4302e1ff3516Dc744A19e992D27CAC252E](https://mantlescan.xyz//address/0x64df9D4302e1ff3516Dc744A19e992D27CAC252E) | [0x0000000000000000000000000000000000000000](https://mantlescan.xyz//address/0x0000000000000000000000000000000000000000) |


## Raw diff

```json
{
  "poolConfig": {
    "priceOracleSentinel": {
      "from": "0x64df9D4302e1ff3516Dc744A19e992D27CAC252E",
      "to": "0x0000000000000000000000000000000000000000"
    }
  },
  "reserves": {
    "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    },
    "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    },
    "0x779Ded0c9e1022225f8E0630b35a9b54bE713736": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    },
    "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8": {
      "debtCeiling": {
        "from": 200000000,
        "to": 0
      }
    },
    "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111": {
      "debtCeiling": {
        "from": 3000000000,
        "to": 0
      }
    },
    "0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    }
  }
}
```
