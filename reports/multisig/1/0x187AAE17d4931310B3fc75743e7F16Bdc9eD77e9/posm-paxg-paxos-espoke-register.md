## Safe transaction batch "PAXG Paxos eSpoke position managers registration" on Ethereum

- safe: [0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9](https://etherscan.io/address/0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9) (version: 1.4.1, threshold: 5/8)
- safeTxHash: 0x5e18bce769f1efe7e0ca7b707a0043bbce2de6a7cb8be98446f2e61e5433c9af (at nonce 47, batched via MultiSendCallOnly 0x9641d764fc13c8B624c04430C7356C1C7C8102e2)
- description: Registers the PAXG Paxos eSpoke (0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616) on the Giver, Taker and Config position managers and on the SignatureGateway.
- transactions:
  - [0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e](https://etherscan.io/address/0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":"true"}, callData: 0xc084998a000000000000000000000000115af1c2db26cd8eca3f29055e4e424af4edf6160000000000000000000000000000000000000000000000000000000000000001
  - [0x6c044c0D3801499bCAbfAd458B70880bc518e9F7](https://etherscan.io/address/0x6c044c0D3801499bCAbfAd458B70880bc518e9F7), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":"true"}, callData: 0xc084998a000000000000000000000000115af1c2db26cd8eca3f29055e4e424af4edf6160000000000000000000000000000000000000000000000000000000000000001
  - [0x51305839CE822a7b4b12AA7D86eA7005052d575c](https://etherscan.io/address/0x51305839CE822a7b4b12AA7D86eA7005052d575c), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":"true"}, callData: 0xc084998a000000000000000000000000115af1c2db26cd8eca3f29055e4e424af4edf6160000000000000000000000000000000000000000000000000000000000000001
  - [0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d](https://etherscan.io/address/0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":"true"}, callData: 0xc084998a000000000000000000000000115af1c2db26cd8eca3f29055e4e424af4edf6160000000000000000000000000000000000000000000000000000000000000001
- simulatedExecutionAt: 06/11/2026, 08:17:59, timestamp: 1793953079, block: 26354563
- gasUsed: 171,184 (max tx gas limit: 16,777,216)

#### GiverPositionManager at `0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.GIVER_POSITION_MANAGER")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x115af1c2db26cd8eca3f29055e4e424af4edf616` @@
- false
+ true

```
#### SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`

```diff
@@ `nonce` nonce  @@
- "47"
+ "48"

```
#### ConfigPositionManager at `0x51305839CE822a7b4b12AA7D86eA7005052d575c` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.CONFIG_POSITION_MANAGER")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x115af1c2db26cd8eca3f29055e4e424af4edf616` @@
- false
+ true

```
#### TakerPositionManager at `0x6c044c0D3801499bCAbfAd458B70880bc518e9F7` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.TAKER_POSITION_MANAGER")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x115af1c2db26cd8eca3f29055e4e424af4edf616` @@
- false
+ true

```
#### SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x115af1c2db26cd8eca3f29055e4e424af4edf616` @@
- false
+ true

```
### Verification status for contracts touched in the proposal

| Contract | Status |
|---------|------------|
| GiverPositionManager at `0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.GIVER_POSITION_MANAGER") | Contract |
| SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9` | Contract |
| Safe at `0x41675C099F32341bf84BFc5382aF534df5C7461a` | Contract |
| ConfigPositionManager at `0x51305839CE822a7b4b12AA7D86eA7005052d575c` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.CONFIG_POSITION_MANAGER") | Contract |
| TakerPositionManager at `0x6c044c0D3801499bCAbfAd458B70880bc518e9F7` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.TAKER_POSITION_MANAGER") | Contract |
| EOA at `0x6F0A37801E9dC215AA70117553B5501e65FEea0C` | EOA |
| MultiSendCallOnly at `0x9641d764fc13c8B624c04430C7356C1C7C8102e2` | Contract |
| SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY") | Contract |

### Selfdestruct analysis

| Address | Result |
|---------|------------|
| GiverPositionManager at `0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.GIVER_POSITION_MANAGER") | DelegateCall |
| SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9` | DelegateCall |
| Safe at `0x41675C099F32341bf84BFc5382aF534df5C7461a` | DelegateCall |
| ConfigPositionManager at `0x51305839CE822a7b4b12AA7D86eA7005052d575c` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.CONFIG_POSITION_MANAGER") | DelegateCall |
| TakerPositionManager at `0x6c044c0D3801499bCAbfAd458B70880bc518e9F7` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.TAKER_POSITION_MANAGER") | DelegateCall |
| EOA at `0x6F0A37801E9dC215AA70117553B5501e65FEea0C` | EOA |
| MultiSendCallOnly at `0x9641d764fc13c8B624c04430C7356C1C7C8102e2` | Safe |
| SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY") | DelegateCall |

### Events emitted from the proposal

- GiverPositionManager at `0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.GIVER_POSITION_MANAGER")
  - `RegisterSpoke({"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":true})`
- SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`
  - `ExecutionSuccess({"txHash":"0x5e18bce769f1efe7e0ca7b707a0043bbce2de6a7cb8be98446f2e61e5433c9af","payment":"0"})`
- ConfigPositionManager at `0x51305839CE822a7b4b12AA7D86eA7005052d575c` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.CONFIG_POSITION_MANAGER")
  - `RegisterSpoke({"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":true})`
- TakerPositionManager at `0x6c044c0D3801499bCAbfAd458B70880bc518e9F7` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.TAKER_POSITION_MANAGER")
  - `RegisterSpoke({"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":true})`
- SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY")
  - `RegisterSpoke({"spoke":"0x115aF1C2db26cD8ECa3f29055E4E424AF4edF616","registered":true})`
