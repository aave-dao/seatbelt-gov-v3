// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {GovV3StorageHelpers} from "aave-helpers/src/GovV3Helpers.sol";
import {IPayloadsControllerCore} from "aave-address-book/GovernanceV3.sol";
import {ProtocolV3TestBase, ReserveConfig, IPool} from "aave-helpers/src/ProtocolV3TestBase.sol";
import {AaveV3Base} from "aave-address-book/AaveV3Base.sol";
import {AaveV3Gnosis} from "aave-address-book/AaveV3Gnosis.sol";
import {AaveV3Metis} from "aave-address-book/AaveV3Metis.sol";
import {AaveV3Ethereum} from "aave-address-book/AaveV3Ethereum.sol";
import {AaveV3Polygon} from "aave-address-book/AaveV3Polygon.sol";
import {AaveV3Optimism} from "aave-address-book/AaveV3Optimism.sol";
import {AaveV3Arbitrum} from "aave-address-book/AaveV3Arbitrum.sol";
import {AaveV3BNB} from "aave-address-book/AaveV3BNB.sol";
import {AaveV3Scroll} from "aave-address-book/AaveV3Scroll.sol";
import {AaveV3Avalanche} from "aave-address-book/AaveV3Avalanche.sol";
import {AaveV3Linea} from "aave-address-book/AaveV3Linea.sol";
import {AaveV3Sonic} from "aave-address-book/AaveV3Sonic.sol";
import {AaveV3Celo} from "aave-address-book/AaveV3Celo.sol";
import {AaveV3Soneium} from "aave-address-book/AaveV3Soneium.sol";
import {AaveV3Plasma} from "aave-address-book/AaveV3Plasma.sol";
import {AaveV3Mantle} from "aave-address-book/AaveV3Mantle.sol";
import {AaveV3MegaEth} from "aave-address-book/AaveV3MegaEth.sol";
import {ChainIds} from "solidity-utils/contracts/utils/ChainHelpers.sol";

contract E2EPayload is Script, ProtocolV3TestBase {
    error UnknownPool();
    error CustomCallFailed(uint256 index);

    struct CustomCall {
        address from;
        address target;
        uint256 value;
        bytes data;
    }

    function run(uint40 payloadId, address payloadsController) public {
        run(payloadId, payloadsController, "", "");
    }

    function run(
        uint40 payloadId,
        address payloadsController,
        bytes memory preCalls,
        bytes memory postCalls
    ) public {
        IPool pool = _getPool();
        if (address(pool) == address(0)) revert UnknownPool();
        defaultTest(
            string(
                abi.encodePacked(
                    "foundry/",
                    vm.toString(block.chainid),
                    "_",
                    vm.toString(payloadId)
                )
            ),
            pool,
            payloadId,
            payloadsController,
            false,
            preCalls,
            postCalls
        );
    }

    /// @dev Default test function for E2E testing.
    function defaultTest(
        string memory reportName,
        IPool pool,
        uint40 payloadId,
        address payloadsController,
        bool runE2E
    ) public returns (ReserveConfig[] memory, ReserveConfig[] memory) {
        return defaultTest(reportName, pool, payloadId, payloadsController, runE2E, "", "");
    }

    function defaultTest(
        string memory reportName,
        IPool pool,
        uint40 payloadId,
        address payloadsController,
        bool runE2E,
        bytes memory preCalls,
        bytes memory postCalls
    ) public returns (ReserveConfig[] memory, ReserveConfig[] memory) {
        _runCustomCalls(preCalls);

        string memory beforeString = string(
            abi.encodePacked(reportName, "_before")
        );
        ReserveConfig[] memory configBefore = createConfigurationSnapshot(
            beforeString,
            pool
        );

        GovV3StorageHelpers.readyPayloadId(vm, IPayloadsControllerCore(payloadsController), payloadId);
        IPayloadsControllerCore(payloadsController).executePayload(payloadId);

        _runCustomCalls(postCalls);

        string memory afterString = string(
            abi.encodePacked(reportName, "_after")
        );
        ReserveConfig[] memory configAfter = createConfigurationSnapshot(
            afterString,
            pool
        );

        _diffReports(payloadId, payloadsController, beforeString, afterString);

        configChangePlausibilityTest(pool, configBefore, configAfter);

        if (runE2E) e2eTest(pool);
        return (configBefore, configAfter);
    }

    function _runCustomCalls(bytes memory encoded) internal {
        if (encoded.length == 0) return;
        CustomCall[] memory calls = abi.decode(encoded, (CustomCall[]));
        for (uint256 i = 0; i < calls.length; ++i) {
            vm.deal(calls[i].from, calls[i].from.balance + 100 ether);
            vm.prank(calls[i].from);
            (bool ok, bytes memory ret) = calls[i].target.call{value: calls[i].value}(
                calls[i].data
            );
            if (!ok) {
                if (ret.length == 0) revert CustomCallFailed(i);
                assembly {
                    revert(add(ret, 0x20), mload(ret))
                }
            }
        }
    }

    function _diffReports(
        uint40 payloadId,
        address payloadsController,
        string memory reportBefore,
        string memory reportAfter
    ) internal {
        string memory outPath = string(
            abi.encodePacked(
                "./reports/payloads/",
                vm.toString(block.chainid),
                "/",
                vm.toString(payloadsController),
                "/",
                vm.toString(payloadId),
                "_forge.md"
            )
        );
        string memory beforePath = string(
            abi.encodePacked("./reports/", reportBefore, ".json")
        );
        string memory afterPath = string(
            abi.encodePacked("./reports/", reportAfter, ".json")
        );

        string[] memory inputs = new string[](7);
        inputs[0] = "npx";
        inputs[1] = "@aave-dao/aave-helpers-js@^1.0.6";
        inputs[2] = "diff-snapshots";
        inputs[3] = beforePath;
        inputs[4] = afterPath;
        inputs[5] = "-o";
        inputs[6] = outPath;
        vm.ffi(inputs);
    }

    function _getPool() internal view returns (IPool pool) {
        if (block.chainid == ChainIds.MAINNET) return AaveV3Ethereum.POOL;
        if (block.chainid == ChainIds.OPTIMISM) return AaveV3Optimism.POOL;
        if (block.chainid == ChainIds.ARBITRUM) return AaveV3Arbitrum.POOL;
        if (block.chainid == ChainIds.METIS) return AaveV3Metis.POOL;
        if (block.chainid == ChainIds.POLYGON) return AaveV3Polygon.POOL;
        if (block.chainid == ChainIds.AVALANCHE) return AaveV3Avalanche.POOL;
        if (block.chainid == ChainIds.BNB) return AaveV3BNB.POOL;
        if (block.chainid == ChainIds.SCROLL) return AaveV3Scroll.POOL;
        if (block.chainid == ChainIds.GNOSIS) return AaveV3Gnosis.POOL;
        if (block.chainid == ChainIds.BASE) return AaveV3Base.POOL;
        if (block.chainid == ChainIds.LINEA) return AaveV3Linea.POOL;
        if (block.chainid == ChainIds.SONIC) return AaveV3Sonic.POOL;
        if (block.chainid == ChainIds.CELO) return AaveV3Celo.POOL;
        if (block.chainid == ChainIds.SONEIUM) return AaveV3Soneium.POOL;
        if (block.chainid == ChainIds.PLASMA) return AaveV3Plasma.POOL;
        if (block.chainid == ChainIds.MANTLE) return AaveV3Mantle.POOL;
        if (block.chainid == ChainIds.MEGAETH) return AaveV3MegaEth.POOL;
    }
}
