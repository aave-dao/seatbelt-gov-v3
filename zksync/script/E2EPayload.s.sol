// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {GovV3StorageHelpers} from "aave-helpers/src/GovV3Helpers.sol";
import {IPayloadsControllerCore} from "aave-address-book/GovernanceV3.sol";
import {ProtocolV3TestBase, ReserveConfig, IPool} from "aave-helpers/zksync/src/ProtocolV3TestBase.sol";
import {AaveV3ZkSync} from "aave-address-book/AaveV3ZkSync.sol";
import {ChainIds} from "solidity-utils/contracts/utils/ChainHelpers.sol";

contract E2EPayload is Script, ProtocolV3TestBase {
    function run(uint40 payloadId, address payloadsController) public {
        IPool pool = _getPool();
        if (address(pool) == address(0)) return;
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
            false
        );
    }

    function defaultTest(
        string memory reportName,
        IPool pool,
        uint40 payloadId,
        address payloadsController,
        bool runE2E
    ) public returns (ReserveConfig[] memory, ReserveConfig[] memory) {
        string memory beforeString = string(
            abi.encodePacked(reportName, "_before")
        );
        ReserveConfig[] memory configBefore = createConfigurationSnapshot(
            beforeString,
            pool
        );

        GovV3StorageHelpers.readyPayloadId(vm, IPayloadsControllerCore(payloadsController), payloadId);
        IPayloadsControllerCore(payloadsController).executePayload(payloadId);

        string memory afterString = string(
            abi.encodePacked(reportName, "_after")
        );
        ReserveConfig[] memory configAfter = createConfigurationSnapshot(
            afterString,
            pool
        );

        _diffReports(payloadId, payloadsController, beforeString, afterString);

        configChangePlausibilityTest(configBefore, configAfter);

        if (runE2E) e2eTest(pool);
        return (configBefore, configAfter);
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
        if (block.chainid == ChainIds.ZKSYNC) return AaveV3ZkSync.POOL;
    }
}
