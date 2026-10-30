## Reserve changes

### Reserves altered

#### ezETH ([0x2416092f143378750bb29b79eD961ab195CcEea5](https://arbiscan.io/address/0x2416092f143378750bb29b79eD961ab195CcEea5))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 66 ezETH | 1 ezETH |


#### tBTC ([0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40](https://arbiscan.io/address/0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 35 tBTC | 1 tBTC |


#### EURS ([0xD22a58f79e9481D1a88e00c343885A588b34b68B](https://arbiscan.io/address/0xD22a58f79e9481D1a88e00c343885A588b34b68B))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 80,000 EURS | 1 EURS |
| borrowCap | 65,000 EURS | 1 EURS |
| reserveFactor | 20 % [2000] | 50 % [5000] |


#### DAI ([0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1](https://arbiscan.io/address/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 4,900,000 DAI | 1 DAI |
| borrowCap | 4,410,000 DAI | 1 DAI |
| reserveFactor | 25 % [2500] | 50 % [5000] |


#### rETH ([0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8](https://arbiscan.io/address/0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 1,300 rETH | 1 rETH |
| ltv | 69 % [6900] | 0 % [0] |
| reserveFactor | 15 % [1500] | 50 % [5000] |


#### USDC ([0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbiscan.io/address/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 1,700,000 USDC | 1 USDC |
| borrowCap | 1,530,000 USDC | 1 USDC |
| reserveFactor | 50 % [5000] | 75 % [7500] |


## Raw diff

```json
{
  "reserves": {
    "0x2416092f143378750bb29b79eD961ab195CcEea5": {
      "isFrozen": {
        "from": false,
        "to": true
      },
      "supplyCap": {
        "from": 66,
        "to": 1
      }
    },
    "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40": {
      "isFrozen": {
        "from": false,
        "to": true
      },
      "supplyCap": {
        "from": 35,
        "to": 1
      }
    },
    "0xD22a58f79e9481D1a88e00c343885A588b34b68B": {
      "borrowCap": {
        "from": 65000,
        "to": 1
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 80000,
        "to": 1
      }
    },
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1": {
      "borrowCap": {
        "from": 4410000,
        "to": 1
      },
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 2500,
        "to": 5000
      },
      "supplyCap": {
        "from": 4900000,
        "to": 1
      }
    },
    "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8": {
      "isFrozen": {
        "from": false,
        "to": true
      },
      "ltv": {
        "from": 6900,
        "to": 0
      },
      "reserveFactor": {
        "from": 1500,
        "to": 5000
      },
      "supplyCap": {
        "from": 1300,
        "to": 1
      }
    },
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8": {
      "borrowCap": {
        "from": 1530000,
        "to": 1
      },
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 5000,
        "to": 7500
      },
      "supplyCap": {
        "from": 1700000,
        "to": 1
      }
    }
  }
}
```
