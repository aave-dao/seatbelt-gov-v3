## Reserve changes

### Reserves added

#### USDe ([0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34](https://megaeth.blockscout.com/address/0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34))

| description | value |
| --- | --- |
| id | 7 |
| decimals | 18 |
| isActive | :white_check_mark: |
| isFrozen | :x: |
| isPaused | :x: |
| supplyCap | 50,000,000 USDe |
| borrowCap | 40,000,000 USDe |
| debtCeiling | 0 $ [0] |
| isSiloed | :x: |
| isFlashloanable | :white_check_mark: |
| oracle | [0x6B00ffb3852E87c13b7f56660a7dfF64191180B3](https://megaeth.blockscout.com/address/0x6B00ffb3852E87c13b7f56660a7dfF64191180B3) |
| oracleDecimals | 8 |
| oracleDescription | Capped USDe/USD |
| oracleLatestAnswer | 1.00021295 $ |
| usageAsCollateralEnabled | :x: |
| ltv | 0 % [0] |
| liquidationThreshold | 0 % [0] |
| liquidationBonus | 0 % |
| liquidationProtocolFee | 10 % [1000] |
| reserveFactor | 25 % [2500] |
| aToken | [0x78f2cB75D664d6f71433174056c25A5958B4016F](https://megaeth.blockscout.com/address/0x78f2cB75D664d6f71433174056c25A5958B4016F) |
| aTokenName | Aave MegaEth USDe |
| aTokenSymbol | aMegUSDe |
| variableDebtToken | [0x7dD785D88A64dd7db6b46DaD4d2e0728CC65e009](https://megaeth.blockscout.com/address/0x7dD785D88A64dd7db6b46DaD4d2e0728CC65e009) |
| variableDebtTokenName | Aave MegaEth Variable Debt USDe |
| variableDebtTokenSymbol | variableDebtMegUSDe |
| borrowingEnabled | :white_check_mark: |
| isBorrowableInIsolation | :x: |
| interestRateStrategy | [0x5cC4f782cFe249286476A7eFfD9D7bd215768194](https://megaeth.blockscout.com/address/0x5cC4f782cFe249286476A7eFfD9D7bd215768194) |
| aTokenUnderlyingBalance | 1 USDe [1000000000000000000] |
| virtualBalance | 1 USDe [1000000000000000000] |
| optimalUsageRatio | 85 % |
| maxVariableBorrowRate | 16 % |
| baseVariableBorrowRate | 0 % |
| variableRateSlope1 | 4 % |
| variableRateSlope2 | 12 % |
| interestRate | <pre lang="mermaid">xychart-beta&#13;title "Interest Rate Model"&#13;x-axis "Utilization (%)" [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]&#13;y-axis "Rate (%)"&#13;line [0, 0.23529411764705882, 0.47058823529411764, 0.7058823529411765, 0.9411764705882353, 1.1764705882352942, 1.411764705882353, 1.6470588235294117, 1.8823529411764706, 2.1176470588235294, 2.3529411764705883, 2.588235294117647, 2.823529411764706, 3.0588235294117645, 3.2941176470588234, 3.5294117647058822, 3.764705882352941, 4, 8, 12, 16]&#13;</pre> |


## EMode changes

### EMode: USDe__USDT0_USDm (id: 7)

| description | value before | value after |
| --- | --- | --- |
| label | - | USDe__USDT0_USDm |
| ltv | - | 90 % |
| liquidationThreshold | - | 93 % |
| liquidationBonus | - | 2 % [10200] |
| borrowableBitmap | - | USDT0, USDm |
| collateralBitmap | - | USDe |


## Raw diff

```json
{
  "eModes": {
    "7": {
      "from": null,
      "to": {
        "borrowableBitmap": "12",
        "collateralBitmap": "128",
        "eModeCategory": 7,
        "label": "USDe__USDT0_USDm",
        "liquidationBonus": 10200,
        "liquidationThreshold": 9300,
        "ltv": 9000
      }
    }
  },
  "reserves": {
    "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34": {
      "from": null,
      "to": {
        "aToken": "0x78f2cB75D664d6f71433174056c25A5958B4016F",
        "aTokenName": "Aave MegaEth USDe",
        "aTokenSymbol": "aMegUSDe",
        "aTokenUnderlyingBalance": "1000000000000000000",
        "borrowCap": 40000000,
        "borrowingEnabled": true,
        "debtCeiling": 0,
        "decimals": 18,
        "id": 7,
        "interestRateStrategy": "0x5cC4f782cFe249286476A7eFfD9D7bd215768194",
        "isActive": true,
        "isBorrowableInIsolation": false,
        "isFlashloanable": true,
        "isFrozen": false,
        "isPaused": false,
        "isSiloed": false,
        "liquidationBonus": 0,
        "liquidationProtocolFee": 1000,
        "liquidationThreshold": 0,
        "ltv": 0,
        "oracle": "0x6B00ffb3852E87c13b7f56660a7dfF64191180B3",
        "oracleDecimals": 8,
        "oracleDescription": "Capped USDe/USD",
        "oracleLatestAnswer": "100021295",
        "reserveFactor": 2500,
        "supplyCap": 50000000,
        "symbol": "USDe",
        "underlying": "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
        "usageAsCollateralEnabled": false,
        "variableDebtToken": "0x7dD785D88A64dd7db6b46DaD4d2e0728CC65e009",
        "variableDebtTokenName": "Aave MegaEth Variable Debt USDe",
        "variableDebtTokenSymbol": "variableDebtMegUSDe",
        "virtualBalance": "1000000000000000000"
      }
    }
  },
  "strategies": {
    "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34": {
      "from": null,
      "to": {
        "address": "0x5cC4f782cFe249286476A7eFfD9D7bd215768194",
        "baseVariableBorrowRate": "0",
        "maxVariableBorrowRate": "160000000000000000000000000",
        "optimalUsageRatio": "850000000000000000000000000",
        "variableRateSlope1": "40000000000000000000000000",
        "variableRateSlope2": "120000000000000000000000000"
      }
    }
  }
}
```
