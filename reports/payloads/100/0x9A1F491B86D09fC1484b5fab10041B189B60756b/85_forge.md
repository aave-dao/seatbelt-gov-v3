## Reserve changes

### Reserves altered

#### WETH ([0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1](https://gnosisscan.io/address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 3,500 WETH | 1 WETH |
| borrowCap | 2,400 WETH | 1 WETH |
| ltv | 80 % [8000] | 0 % [0] |
| reserveFactor | 15 % [1500] | 50 % [5000] |


#### USDC ([0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83](https://gnosisscan.io/address/0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83))

| description | value before | value after |
| --- | --- | --- |
| reserveFactor | 80 % [8000] | 99 % [9900] |


## Raw diff

```json
{
  "reserves": {
    "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1": {
      "borrowCap": {
        "from": 2400,
        "to": 1
      },
      "isFrozen": {
        "from": false,
        "to": true
      },
      "ltv": {
        "from": 8000,
        "to": 0
      },
      "reserveFactor": {
        "from": 1500,
        "to": 5000
      },
      "supplyCap": {
        "from": 3500,
        "to": 1
      }
    },
    "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83": {
      "reserveFactor": {
        "from": 8000,
        "to": 9900
      }
    }
  }
}
```
