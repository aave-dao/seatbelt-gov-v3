## Safe transaction batch "MAPLE Spoke position managers registration" on Ethereum

- safe: [0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9](https://etherscan.io/address/0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9) (version: 1.4.1, threshold: 5/8)
- safeTxHash: 0xe4da2d5ace4cb23cb854db22062a8aa177727a98f4a0bcade6c5e2fcd36e937a (at nonce 23, batched via MultiSendCallOnly 0xA83c336B20401Af773B6219BA5027174338D1836)
- description: Registers the MAPLE Spoke (0x774b9655413c34809c1f1b16b654465A89EBE989) on the Giver, Taker and Config position managers and on the SignatureGateway.
- transactions:
  - [0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e](https://etherscan.io/address/0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":"true"}, callData: 0xc084998a000000000000000000000000774b9655413c34809c1f1b16b654465a89ebe9890000000000000000000000000000000000000000000000000000000000000001
  - [0x6c044c0D3801499bCAbfAd458B70880bc518e9F7](https://etherscan.io/address/0x6c044c0D3801499bCAbfAd458B70880bc518e9F7), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":"true"}, callData: 0xc084998a000000000000000000000000774b9655413c34809c1f1b16b654465a89ebe9890000000000000000000000000000000000000000000000000000000000000001
  - [0x51305839CE822a7b4b12AA7D86eA7005052d575c](https://etherscan.io/address/0x51305839CE822a7b4b12AA7D86eA7005052d575c), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":"true"}, callData: 0xc084998a000000000000000000000000774b9655413c34809c1f1b16b654465a89ebe9890000000000000000000000000000000000000000000000000000000000000001
  - [0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d](https://etherscan.io/address/0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d), value: 0, signature: registerSpoke(address,bool), args: {"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":"true"}, callData: 0xc084998a000000000000000000000000774b9655413c34809c1f1b16b654465a89ebe9890000000000000000000000000000000000000000000000000000000000000001
- simulatedExecutionAt: 31/07/2026, 08:28:06, timestamp: 1785486486, block: 25651643
- gasUsed: 171,244 (max tx gas limit: 16,777,216)

#### GiverPositionManager at `0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.GIVER_POSITION_MANAGER")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x774b9655413c34809c1f1b16b654465a89ebe989` @@
- false
+ true

```
#### SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`

```diff
@@ `nonce` nonce  @@
- "23"
+ "24"

```
#### ConfigPositionManager at `0x51305839CE822a7b4b12AA7D86eA7005052d575c` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.CONFIG_POSITION_MANAGER")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x774b9655413c34809c1f1b16b654465a89ebe989` @@
- false
+ true

```
#### TakerPositionManager at `0x6c044c0D3801499bCAbfAd458B70880bc518e9F7` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.TAKER_POSITION_MANAGER")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x774b9655413c34809c1f1b16b654465a89ebe989` @@
- false
+ true

```
#### SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY")

```diff
@@ `_registeredSpokes` mapping (address => bool) key `0x774b9655413c34809c1f1b16b654465a89ebe989` @@
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
| unknown contract name at `0x9440850335c7C2a644dc2abEBBA93463c9736F2C` | EOA |
| MultiSendCallOnly at `0xA83c336B20401Af773B6219BA5027174338D1836` | Contract |
| SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY") | Contract |

### Selfdestruct analysis

| Address | Result |
|---------|------------|
| GiverPositionManager at `0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.GIVER_POSITION_MANAGER") | DelegateCall |
| SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9` | DelegateCall |
| Safe at `0x41675C099F32341bf84BFc5382aF534df5C7461a` | DelegateCall |
| ConfigPositionManager at `0x51305839CE822a7b4b12AA7D86eA7005052d575c` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.CONFIG_POSITION_MANAGER") | DelegateCall |
| TakerPositionManager at `0x6c044c0D3801499bCAbfAd458B70880bc518e9F7` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.TAKER_POSITION_MANAGER") | DelegateCall |
| unknown contract name at `0x9440850335c7C2a644dc2abEBBA93463c9736F2C` | Empty |
| MultiSendCallOnly at `0xA83c336B20401Af773B6219BA5027174338D1836` | Safe |
| SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY") | DelegateCall |

### Events emitted from the proposal

- GiverPositionManager at `0x17A54b8d6D9C68e7fa1C7112AC998EA1BA51d11e` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.GIVER_POSITION_MANAGER")
  - `RegisterSpoke({"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":true})`
- SafeProxy at `0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9`
  - `ExecutionSuccess({"txHash":"0xe4da2d5ace4cb23cb854db22062a8aa177727a98f4a0bcade6c5e2fcd36e937a","payment":"0"})`
- ConfigPositionManager at `0x51305839CE822a7b4b12AA7D86eA7005052d575c` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.CONFIG_POSITION_MANAGER")
  - `RegisterSpoke({"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":true})`
- TakerPositionManager at `0x6c044c0D3801499bCAbfAd458B70880bc518e9F7` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.TAKER_POSITION_MANAGER")
  - `RegisterSpoke({"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":true})`
- SignatureGateway at `0xfbC184337Dc6595D8bf62968Bda46e7De7AF9c3d` [:ghost:](https://github.com/aave-dao/aave-address-book  "AaveV4Ethereum.POSITION_MANAGERS.SIGNATURE_GATEWAY")
  - `RegisterSpoke({"spoke":"0x774b9655413c34809c1f1b16b654465A89EBE989","registered":true})`
