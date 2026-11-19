## Safe transaction batch "Paxos TokenSpoke deactivations" on Ethereum

- safe: [0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9](https://etherscan.io/address/0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9) (version: 1.4.1, threshold: 5/8)
- safeTxHash: 0x8c4c9a35fc8990220ca9cffe34a6556efb2f519b4811e3686b74b5afc6c67d25 (at nonce 25, batched via MultiSendCallOnly 0xA83c336B20401Af773B6219BA5027174338D1836)
- description: Deactivates the Paxos PT_USDG_24SEP2026, USDC and USDT TokenizationSpokes on the Paxos Hub.
- transactions:
  - [0x1F0753480bB03EaA00863224602267B7E0525C3d](https://etherscan.io/address/0x1F0753480bB03EaA00863224602267B7E0525C3d), value: 0, signature: deactivateSpoke(address,address), args: {"hub":"0x62d63197660c080236193CA60b70E49A08E90368","spoke":"0x27eF1140364948A0E30E248297FfDFE5a4091ec4"}, callData: 0x0e50f67a00000000000000000000000062d63197660c080236193ca60b70e49a08e9036800000000000000000000000027ef1140364948a0e30e248297ffdfe5a4091ec4
  - [0x1F0753480bB03EaA00863224602267B7E0525C3d](https://etherscan.io/address/0x1F0753480bB03EaA00863224602267B7E0525C3d), value: 0, signature: deactivateSpoke(address,address), args: {"hub":"0x62d63197660c080236193CA60b70E49A08E90368","spoke":"0x4131E0B2E7AFeCEAf3d3b4225aA61a3B2B7535b8"}, callData: 0x0e50f67a00000000000000000000000062d63197660c080236193ca60b70e49a08e903680000000000000000000000004131e0b2e7afeceaf3d3b4225aa61a3b2b7535b8
  - [0x1F0753480bB03EaA00863224602267B7E0525C3d](https://etherscan.io/address/0x1F0753480bB03EaA00863224602267B7E0525C3d), value: 0, signature: deactivateSpoke(address,address), args: {"hub":"0x62d63197660c080236193CA60b70E49A08E90368","spoke":"0x8Dabe53E8cB991c57f0307F6f419E6D469b0deAA"}, callData: 0x0e50f67a00000000000000000000000062d63197660c080236193ca60b70e49a08e903680000000000000000000000008dabe53e8cb991c57f0307f6f419e6d469b0deaa
- simulatedExecutionAt: 05/08/2026, 12:40:51, timestamp: 1785933651, block: 25688789
- gasUsed: 193,182 (max tx gas limit: 16,777,216)

#### SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`

```diff
@@ `nonce` nonce  @@
- "25"
+ "26"

```


## Aave V4 changes

#### TransparentUpgradeableProxy at `0x62d63197660c080236193CA60b70E49A08E90368` with implementation HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUBS.PAXOS_HUB")

```diff
@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"0"`.0x27ef1140364948a0e30e248297ffdfe5a4091ec4.active @@
- true
+ false

@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"1"`.0x4131e0b2e7afeceaf3d3b4225aa61a3b2b7535b8.active @@
- true
+ false

@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"2"`.0x8dabe53e8cb991c57f0307f6f419e6d469b0deaa.active @@
- true
+ false

```
### Verification status for contracts touched in the proposal

| Contract | Status |
|---------|------------|
| AccessManagerEnumerable at `0x08aE3BE30958cDd1847ec58fFfd4C451a87fDF01` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.ACCESS_MANAGER") | Contract |
| SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9` | Contract |
| HubConfigurator at `0x1F0753480bB03EaA00863224602267B7E0525C3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUB_CONFIGURATOR") | Contract |
| Safe at `0x41675C099F32341bf84BFc5382aF534df5C7461a` | Contract |
| HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` | Contract |
| TransparentUpgradeableProxy at `0x62d63197660c080236193CA60b70E49A08E90368` with implementation HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUBS.PAXOS_HUB") | Contract |
| unknown contract name at `0x9440850335c7C2a644dc2abEBBA93463c9736F2C` | EOA |
| MultiSendCallOnly at `0xA83c336B20401Af773B6219BA5027174338D1836` | Contract |

### Selfdestruct analysis

| Address | Result |
|---------|------------|
| AccessManagerEnumerable at `0x08aE3BE30958cDd1847ec58fFfd4C451a87fDF01` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.ACCESS_MANAGER") | DelegateCall |
| SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9` | DelegateCall |
| HubConfigurator at `0x1F0753480bB03EaA00863224602267B7E0525C3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUB_CONFIGURATOR") | Safe |
| Safe at `0x41675C099F32341bf84BFc5382aF534df5C7461a` | DelegateCall |
| HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` | Safe |
| TransparentUpgradeableProxy at `0x62d63197660c080236193CA60b70E49A08E90368` with implementation HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUBS.PAXOS_HUB") | DelegateCall |
| unknown contract name at `0x9440850335c7C2a644dc2abEBBA93463c9736F2C` | Empty |
| MultiSendCallOnly at `0xA83c336B20401Af773B6219BA5027174338D1836` | Safe |

### Events emitted from the proposal

- SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`
  - `ExecutionSuccess({"txHash":"0x8c4c9a35fc8990220ca9cffe34a6556efb2f519b4811e3686b74b5afc6c67d25","payment":"0"})`
- TransparentUpgradeableProxy at `0x62d63197660c080236193CA60b70E49A08E90368` with implementation HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUBS.PAXOS_HUB")
  - `UpdateSpokeConfig({"assetId":"0","spoke":"0x27eF1140364948A0E30E248297FfDFE5a4091ec4","config":{"addCap":0,"drawCap":0,"riskPremiumThreshold":0,"active":false,"halted":false}})`
  - `UpdateSpokeConfig({"assetId":"1","spoke":"0x4131E0B2E7AFeCEAf3d3b4225aA61a3B2B7535b8","config":{"addCap":0,"drawCap":0,"riskPremiumThreshold":0,"active":false,"halted":false}})`
  - `UpdateSpokeConfig({"assetId":"2","spoke":"0x8Dabe53E8cB991c57f0307F6f419E6D469b0deAA","config":{"addCap":0,"drawCap":0,"riskPremiumThreshold":0,"active":false,"halted":false}})`
