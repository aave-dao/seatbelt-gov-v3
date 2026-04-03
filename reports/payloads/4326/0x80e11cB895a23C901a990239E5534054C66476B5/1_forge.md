## Reserve changes

### Reserves altered

#### USDT0 ([0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb](https://megaeth.blockscout.com/address/0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


#### USDm ([0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7](https://megaeth.blockscout.com/address/0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7))

| description | value before | value after |
| --- | --- | --- |
| isBorrowableInIsolation | :white_check_mark: | :x: |


## Pool config changes

| description | value before | value after |
| --- | --- | --- |
| priceOracleSentinel | [0x98F756B77D6Fde14E08bb064b248ec7512F9f8ba](https://megaeth.blockscout.com/address/0x98F756B77D6Fde14E08bb064b248ec7512F9f8ba) | [0x0000000000000000000000000000000000000000](https://megaeth.blockscout.com/address/0x0000000000000000000000000000000000000000) |


## Raw diff

```json
{
  "poolConfig": {
    "priceOracleSentinel": {
      "from": "0x98F756B77D6Fde14E08bb064b248ec7512F9f8ba",
      "to": "0x0000000000000000000000000000000000000000"
    }
  },
  "reserves": {
    "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    },
    "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7": {
      "isBorrowableInIsolation": {
        "from": true,
        "to": false
      }
    }
  }
}
```
