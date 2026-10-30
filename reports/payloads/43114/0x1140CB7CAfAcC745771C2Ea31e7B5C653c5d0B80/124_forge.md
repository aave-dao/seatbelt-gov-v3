## Reserve changes

### Reserves altered

#### WBTC.e ([0x50b7545627a5162F82A992c33b87aDc75187B218](https://snowscan.xyz/address/0x50b7545627a5162F82A992c33b87aDc75187B218))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 2,000 WBTC.e | 1 WBTC.e |
| borrowCap | 1,100 WBTC.e | 1 WBTC.e |
| reserveFactor | 20 % [2000] | 50 % [5000] |


#### LINK.e ([0x5947BB275c521040051D82396192181b413227A3](https://snowscan.xyz/address/0x5947BB275c521040051D82396192181b413227A3))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 155,000 LINK.e | 1 LINK.e |
| reserveFactor | 20 % [2000] | 50 % [5000] |


#### AAVE.e ([0x63a72806098Bd3D9520cC43356dD78afe5D386D9](https://snowscan.xyz/address/0x63a72806098Bd3D9520cC43356dD78afe5D386D9))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 7,200 AAVE.e | 1 AAVE.e |
| borrowCap | 0 AAVE.e | 1 AAVE.e |


## Raw diff

```json
{
  "reserves": {
    "0x50b7545627a5162F82A992c33b87aDc75187B218": {
      "borrowCap": {
        "from": 1100,
        "to": 1
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 2000,
        "to": 1
      }
    },
    "0x5947BB275c521040051D82396192181b413227A3": {
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 155000,
        "to": 1
      }
    },
    "0x63a72806098Bd3D9520cC43356dD78afe5D386D9": {
      "borrowCap": {
        "from": 0,
        "to": 1
      },
      "isFrozen": {
        "from": false,
        "to": true
      },
      "supplyCap": {
        "from": 7200,
        "to": 1
      }
    }
  }
}
```
