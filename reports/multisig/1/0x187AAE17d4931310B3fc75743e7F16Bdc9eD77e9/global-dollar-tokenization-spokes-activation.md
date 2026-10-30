## Safe transaction batch "Activate Global Dollar replacement TokenizationSpokes" on Ethereum

- safe: [0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9](https://etherscan.io/address/0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9) (version: 1.4.1, threshold: 5/8)
- safeTxHash: 0xc14ffb2e7380e7988a18c7e711b25c292b2530d71bc007c3dad3226656da8566 (at nonce 23, batched via MultiSendCallOnly 0x9641d764fc13c8B624c04430C7356C1C7C8102e2)
- tx-builder checksum: 0xf2edc30a2f1cf73f6a02e8f63da988912e00fecf1744dddcf6eae6dee4573858
- transactions:
  - [0x1F0753480bB03EaA00863224602267B7E0525C3d](https://etherscan.io/address/0x1F0753480bB03EaA00863224602267B7E0525C3d), value: 0, signature: addSpoke(address,address,uint256,(uint40,uint40,uint24,bool,bool)), args: {"hub":"0x62d63197660c080236193CA60b70E49A08E90368","spoke":"0xaed7c529bD2878170B61C758DfAa215AC7a4FD07","assetId":"1","config":"[13000000,0,0,true,false]"}, callData: 0x7cf1dbc500000000000000000000000062d63197660c080236193ca60b70e49a08e90368000000000000000000000000aed7c529bd2878170b61c758dfaa215ac7a4fd0700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000c65d400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000
  - [0x1F0753480bB03EaA00863224602267B7E0525C3d](https://etherscan.io/address/0x1F0753480bB03EaA00863224602267B7E0525C3d), value: 0, signature: addSpoke(address,address,uint256,(uint40,uint40,uint24,bool,bool)), args: {"hub":"0x62d63197660c080236193CA60b70E49A08E90368","spoke":"0xa0e97e45C2f89003730E467Bd484fA3eEcE5B4Cf","assetId":"2","config":"[13000000,0,0,true,false]"}, callData: 0x7cf1dbc500000000000000000000000062d63197660c080236193ca60b70e49a08e90368000000000000000000000000a0e97e45c2f89003730e467bd484fa3eece5b4cf00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000c65d400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000
  - [0x1F0753480bB03EaA00863224602267B7E0525C3d](https://etherscan.io/address/0x1F0753480bB03EaA00863224602267B7E0525C3d), value: 0, signature: addSpoke(address,address,uint256,(uint40,uint40,uint24,bool,bool)), args: {"hub":"0x62d63197660c080236193CA60b70E49A08E90368","spoke":"0x7Df10B4A01350D2A1d95cFbE7c9207d7210A2663","assetId":"0","config":"[0,0,0,true,false]"}, callData: 0x7cf1dbc500000000000000000000000062d63197660c080236193ca60b70e49a08e903680000000000000000000000007df10b4a01350d2a1d95cfbe7c9207d7210a2663000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000
- simulatedExecutionAt: 28/07/2026, 09:29:18, timestamp: 1785230958, block: 25630426
- gasUsed: 347,430 (max tx gas limit: 16,777,216)

#### SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`

```diff
@@ `nonce` nonce  @@
- "23"
+ "24"

```


## Aave V4 changes

#### TransparentUpgradeableProxy at `0x62d63197660c080236193CA60b70E49A08E90368` with implementation HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUBS.PAXOS_HUB")

```diff
@@ `_assetToSpokes` mapping (uint256 => tuple) key `"0"`._inner._positions.0x0000000000000000000000007df10b4a01350d2a1d95cfbe7c9207d7210a2663 @@
- "0"
+ "4"

@@ `_assetToSpokes` mapping (uint256 => tuple) key `"1"`._inner._positions.0x000000000000000000000000aed7c529bd2878170b61c758dfaa215ac7a4fd07 @@
- "0"
+ "4"

@@ `_assetToSpokes` mapping (uint256 => tuple) key `"2"`._inner._positions.0x000000000000000000000000a0e97e45c2f89003730e467bd484fa3eece5b4cf @@
- "0"
+ "4"

@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"0"`.0x7df10b4a01350d2a1d95cfbe7c9207d7210a2663.active @@
- false
+ true

@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"1"`.0xaed7c529bd2878170b61c758dfaa215ac7a4fd07.addCap @@
- "0"
+ "13000000"

@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"1"`.0xaed7c529bd2878170b61c758dfaa215ac7a4fd07.active @@
- false
+ true

@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"2"`.0xa0e97e45c2f89003730e467bd484fa3eece5b4cf.addCap @@
- "0"
+ "13000000"

@@ `_spokes` mapping (uint256 => mapping (address => tuple)) key `"2"`.0xa0e97e45c2f89003730e467bd484fa3eece5b4cf.active @@
- false
+ true

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
| MultiSendCallOnly at `0x9641d764fc13c8B624c04430C7356C1C7C8102e2` | Contract |

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
| MultiSendCallOnly at `0x9641d764fc13c8B624c04430C7356C1C7C8102e2` | Safe |

### Events emitted from the proposal

- SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`
  - `ExecutionSuccess({"txHash":"0xc14ffb2e7380e7988a18c7e711b25c292b2530d71bc007c3dad3226656da8566","payment":"0"})`
- TransparentUpgradeableProxy at `0x62d63197660c080236193CA60b70E49A08E90368` with implementation HubInstance at `0x5471419839a8c1C03683e7e1BD525539180E0c18` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.HUBS.PAXOS_HUB")
  - `AddSpoke({"assetId":"1","spoke":"0xaed7c529bD2878170B61C758DfAa215AC7a4FD07"})`
  - `UpdateSpokeConfig({"assetId":"1","spoke":"0xaed7c529bD2878170B61C758DfAa215AC7a4FD07","config":{"addCap":13000000,"drawCap":0,"riskPremiumThreshold":0,"active":true,"halted":false}})`
  - `AddSpoke({"assetId":"2","spoke":"0xa0e97e45C2f89003730E467Bd484fA3eEcE5B4Cf"})`
  - `UpdateSpokeConfig({"assetId":"2","spoke":"0xa0e97e45C2f89003730E467Bd484fA3eEcE5B4Cf","config":{"addCap":13000000,"drawCap":0,"riskPremiumThreshold":0,"active":true,"halted":false}})`
  - `AddSpoke({"assetId":"0","spoke":"0x7Df10B4A01350D2A1d95cFbE7c9207d7210A2663"})`
  - `UpdateSpokeConfig({"assetId":"0","spoke":"0x7Df10B4A01350D2A1d95cFbE7c9207d7210A2663","config":{"addCap":0,"drawCap":0,"riskPremiumThreshold":0,"active":true,"halted":false}})`
