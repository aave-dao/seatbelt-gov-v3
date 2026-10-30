## Reserve changes

### Reserves altered

#### Cake ([0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82](https://bscscan.com/address/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 600,000 Cake | 1 Cake |
| reserveFactor | 20 % [2000] | 50 % [5000] |


#### wstETH ([0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C](https://bscscan.com/address/0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| ltv | 72 % [7200] | 0 % [0] |
| reserveFactor | 15 % [1500] | 50 % [5000] |


#### FDUSD ([0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409](https://bscscan.com/address/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409))

| description | value before | value after |
| --- | --- | --- |
| isFrozen | :x: | :white_check_mark: |
| supplyCap | 1,200,000 FDUSD | 1 FDUSD |
| borrowCap | 1,080,000 FDUSD | 1 FDUSD |
| reserveFactor | 20 % [2000] | 50 % [5000] |


## Raw diff

```json
{
  "reserves": {
    "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82": {
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 600000,
        "to": 1
      }
    },
    "0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C": {
      "isFrozen": {
        "from": false,
        "to": true
      },
      "ltv": {
        "from": 7200,
        "to": 0
      },
      "reserveFactor": {
        "from": 1500,
        "to": 5000
      }
    },
    "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409": {
      "borrowCap": {
        "from": 1080000,
        "to": 1
      },
      "isFrozen": {
        "from": false,
        "to": true
      },
      "reserveFactor": {
        "from": 2000,
        "to": 5000
      },
      "supplyCap": {
        "from": 1200000,
        "to": 1
      }
    }
  }
}
```
