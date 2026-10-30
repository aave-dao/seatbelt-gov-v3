## Reserve changes

### Reserves altered

#### SUSHI ([0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a](https://polygonscan.com/address/0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 299,320 SUSHI | 1 SUSHI |
| borrowCap | 180,000 SUSHI | 1 SUSHI |
| reserveFactor | 20 % [2000] | 50 % [5000] |


#### CRV ([0x172370d5Cd63279eFa6d502DAB29171933a610AF](https://polygonscan.com/address/0x172370d5Cd63279eFa6d502DAB29171933a610AF))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 1,400,000 CRV | 1 CRV |
| borrowCap | 300,000 CRV | 1 CRV |
| reserveFactor | 35 % [3500] | 50 % [5000] |


#### USDC ([0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 4,390,000 USDC | 1 USDC |
| borrowCap | 3,950,000 USDC | 1 USDC |
| reserveFactor | 60 % [6000] | 85 % [8500] |


#### stMATIC ([0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4](https://polygonscan.com/address/0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 61,000,000 stMATIC | 1 stMATIC |
| borrowCap | 0 stMATIC | 1 stMATIC |


#### jEUR ([0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c](https://polygonscan.com/address/0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 120,000 jEUR | 1 jEUR |
| borrowCap | 100,000 jEUR | 1 jEUR |
| reserveFactor | 20 % [2000] | 50 % [5000] |


#### DPI ([0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369](https://polygonscan.com/address/0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 1,417 DPI | 1 DPI |
| borrowCap | 779 DPI | 1 DPI |
| reserveFactor | 35 % [3500] | 50 % [5000] |


#### EURA ([0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4](https://polygonscan.com/address/0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4))

| description | value before | value after |
| --- | --- | --- |
| supplyCap | 300,000 EURA | 1 EURA |
| borrowCap | 250,000 EURA | 1 EURA |
| reserveFactor | 20 % [2000] | 50 % [5000] |


#### EURS ([0xE111178A87A3BFf0c8d18DECBa5798827539Ae99](https://polygonscan.com/address/0xE111178A87A3BFf0c8d18DECBa5798827539Ae99))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |


#### MaticX ([0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6](https://polygonscan.com/address/0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 9,330,000 MaticX | 1 MaticX |
| reserveFactor | 20 % [2000] | 50 % [5000] |


## Raw diff

```json
{
  "reserves": {
    "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a": {
      "borrowCap": {
        "from": 180000,
        "to": 1
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 299320,
        "to": 1
      }
    },
    "0x172370d5Cd63279eFa6d502DAB29171933a610AF": {
      "borrowCap": {
        "from": 300000,
        "to": 1
      },
      "reserveFactor": {
        "from": 3500,
        "to": 5000
      },
      "supplyCap": {
        "from": 1400000,
        "to": 1
      }
    },
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": {
      "borrowCap": {
        "from": 3950000,
        "to": 1
      },
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 6000,
        "to": 8500
      },
      "supplyCap": {
        "from": 4390000,
        "to": 1
      }
    },
    "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4": {
      "borrowCap": {
        "from": 0,
        "to": 1
      },
      "supplyCap": {
        "from": 61000000,
        "to": 1
      }
    },
    "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c": {
      "borrowCap": {
        "from": 100000,
        "to": 1
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 120000,
        "to": 1
      }
    },
    "0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369": {
      "borrowCap": {
        "from": 779,
        "to": 1
      },
      "reserveFactor": {
        "from": 3500,
        "to": 5000
      },
      "supplyCap": {
        "from": 1417,
        "to": 1
      }
    },
    "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4": {
      "borrowCap": {
        "from": 250000,
        "to": 1
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 300000,
        "to": 1
      }
    },
    "0xE111178A87A3BFf0c8d18DECBa5798827539Ae99": {
      "isFrozen": {
        "from": false,
        "to": true
      }
    },
    "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6": {
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 9330000,
        "to": 1
      }
    }
  }
}
```
