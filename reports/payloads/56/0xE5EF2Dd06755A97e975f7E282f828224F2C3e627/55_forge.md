## Reserve changes

### Reserves altered

#### Cake ([0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82](https://bscscan.com/address/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82))

| description | value before | value after |
| --- | --- | --- |
| borrowingEnabled | :white_check_mark: | :x: |


#### wstETH ([0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C](https://bscscan.com/address/0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C))

| description | value before | value after |
| --- | --- | --- |
| borrowingEnabled | :white_check_mark: | :x: |


#### FDUSD ([0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409](https://bscscan.com/address/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409))

| description | value before | value after |
| --- | --- | --- |
| ltv | 70 % [7000] | 0 % [0] |
| borrowingEnabled | :white_check_mark: | :x: |


## Raw diff

```json
{
  "reserves": {
    "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82": {
      "borrowingEnabled": {
        "from": true,
        "to": false
      }
    },
    "0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C": {
      "borrowingEnabled": {
        "from": true,
        "to": false
      }
    },
    "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409": {
      "borrowingEnabled": {
        "from": true,
        "to": false
      },
      "ltv": {
        "from": 7000,
        "to": 0
      }
    }
  }
}
```
