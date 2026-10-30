import { describe, expect, it } from "vitest";
import {
  TxBuilderTransaction,
  buildPrevalidatedSignature,
  buildSafeTransaction,
  encodeTxBuilderTransaction,
  getTxBuilderTransactionSignature,
} from "./tx-builder";

const ADD_SPOKE_TX: TxBuilderTransaction = {
  to: "0x1F0753480bB03EaA00863224602267B7E0525C3d",
  value: "0",
  data: null,
  contractMethod: {
    inputs: [
      { internalType: "address", name: "hub", type: "address" },
      { internalType: "address", name: "spoke", type: "address" },
      { internalType: "uint256", name: "assetId", type: "uint256" },
      {
        components: [
          { internalType: "uint40", name: "addCap", type: "uint40" },
          { internalType: "uint40", name: "drawCap", type: "uint40" },
          {
            internalType: "uint24",
            name: "riskPremiumThreshold",
            type: "uint24",
          },
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "bool", name: "halted", type: "bool" },
        ],
        internalType: "struct IHub.SpokeConfig",
        name: "config",
        type: "tuple",
      },
    ],
    name: "addSpoke",
    payable: false,
  },
  contractInputsValues: {
    hub: "0x62d63197660c080236193CA60b70E49A08E90368",
    spoke: "0xFaB44fbD00C5056956BC1c4d681A80563E10d2fD",
    assetId: "1",
    config: "[13000000,0,0,true,false]",
  },
};

describe("tx-builder", () => {
  it("should encode a transaction with tuple params", () => {
    // cast calldata "addSpoke(address,address,uint256,(uint40,uint40,uint24,bool,bool))" 0x62d63197660c080236193CA60b70E49A08E90368 0xFaB44fbD00C5056956BC1c4d681A80563E10d2fD 1 "(13000000,0,0,true,false)"
    expect(encodeTxBuilderTransaction(ADD_SPOKE_TX)).toBe(
      "0x7cf1dbc500000000000000000000000062d63197660c080236193ca60b70e49a08e90368000000000000000000000000fab44fbd00c5056956bc1c4d681a80563e10d2fd00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000c65d400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
    );
  });

  it("should keep full precision for integers above 2^53", () => {
    const tx: TxBuilderTransaction = {
      to: ADD_SPOKE_TX.to,
      value: "0",
      data: null,
      contractMethod: {
        inputs: [
          { name: "values", type: "uint256[]" },
          {
            components: [
              { name: "amount", type: "uint256" },
              { name: "enabled", type: "bool" },
            ],
            name: "config",
            type: "tuple",
          },
          { name: "accounts", type: "address[]" },
          { name: "flag", type: "bool" },
        ],
        name: "setValues",
        payable: false,
      },
      contractInputsValues: {
        values: "[9007199254740993,123456789012345678901234567890]",
        config: "[18446744073709551617,false]",
        accounts:
          '["0x62d63197660c080236193CA60b70E49A08E90368","0xFaB44fbD00C5056956BC1c4d681A80563E10d2fD"]',
        flag: "false",
      },
    };
    // cast calldata "setValues(uint256[],(uint256,bool),address[],bool)" "[9007199254740993,123456789012345678901234567890]" "(18446744073709551617,false)" "[0x62d63197660c080236193CA60b70E49A08E90368,0xFaB44fbD00C5056956BC1c4d681A80563E10d2fD]" false
    expect(encodeTxBuilderTransaction(tx)).toBe(
      "0xb746c29300000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000100000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002000000000000100000000000000000000000000000000000000018ee90ff6c373e0ee4e3f0ad2000000000000000000000000000000000000000000000000000000000000000200000000000000000000000062d63197660c080236193ca60b70e49a08e90368000000000000000000000000fab44fbd00c5056956bc1c4d681a80563e10d2fd",
    );
  });

  it("should accept data matching contractMethod", () => {
    const data = encodeTxBuilderTransaction(ADD_SPOKE_TX);
    expect(encodeTxBuilderTransaction({ ...ADD_SPOKE_TX, data })).toBe(data);
  });

  it("should reject data contradicting contractMethod", () => {
    const data = encodeTxBuilderTransaction({
      ...ADD_SPOKE_TX,
      contractInputsValues: {
        ...ADD_SPOKE_TX.contractInputsValues,
        assetId: "2",
      },
    });
    expect(() => encodeTxBuilderTransaction({ ...ADD_SPOKE_TX, data })).toThrow(
      "does not match its contractMethod",
    );
  });

  it("should not quote digits inside strings with escaped quotes", () => {
    const tx: TxBuilderTransaction = {
      to: ADD_SPOKE_TX.to,
      value: "0",
      data: null,
      contractMethod: {
        inputs: [
          { name: "labels", type: "string[]" },
          { name: "count", type: "uint256" },
        ],
        name: "setLabels",
        payable: false,
      },
      contractInputsValues: {
        labels: String.raw`["42 \"q","plain"]`,
        count: "7",
      },
    };
    // cast calldata "setLabels(string[],uint256)" '[42 "q, plain]' 7
    expect(encodeTxBuilderTransaction(tx)).toBe(
      "0x62e190bf00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000534322022710000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005706c61696e000000000000000000000000000000000000000000000000000000",
    );
  });

  it("should render the transaction signature", () => {
    expect(getTxBuilderTransactionSignature(ADD_SPOKE_TX)).toBe(
      "addSpoke(address,address,uint256,(uint40,uint40,uint24,bool,bool))",
    );
  });

  it("should use a plain call for a single transaction", () => {
    const safeTx = buildSafeTransaction([ADD_SPOKE_TX]);
    expect(safeTx.to).toBe(ADD_SPOKE_TX.to);
    expect(safeTx.operation).toBe(0);
    expect(safeTx.data).toBe(encodeTxBuilderTransaction(ADD_SPOKE_TX));
  });

  it("should batch multiple transactions via multiSend delegatecall", () => {
    const multiSend = "0x9641d764fc13c8B624c04430C7356C1C7C8102e2";
    const safeTx = buildSafeTransaction(
      [ADD_SPOKE_TX, { ...ADD_SPOKE_TX, value: "5" }],
      multiSend,
    );
    expect(safeTx.to).toBe(multiSend);
    expect(safeTx.operation).toBe(1);
    expect(safeTx.value).toBe(0n);
    // D=$(cast calldata "addSpoke(address,address,uint256,(uint40,uint40,uint24,bool,bool))" 0x62d63197660c080236193CA60b70E49A08E90368 0xFaB44fbD00C5056956BC1c4d681A80563E10d2fD 1 "(13000000,0,0,true,false)")
    // P(value)=$(cast abi-encode --packed "f(uint8,address,uint256,uint256,bytes)" 0 0x1F0753480bB03EaA00863224602267B7E0525C3d value 228 $D)
    // cast calldata "multiSend(bytes)" $(cast concat-hex $P(0) $P(5))
    expect(safeTx.data).toBe(
      "0x8d80ff0a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000002b2001f0753480bb03eaa00863224602267b7e0525c3d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001047cf1dbc500000000000000000000000062d63197660c080236193ca60b70e49a08e90368000000000000000000000000fab44fbd00c5056956bc1c4d681a80563e10d2fd00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000c65d400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000001f0753480bb03eaa00863224602267b7e0525c3d000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000001047cf1dbc500000000000000000000000062d63197660c080236193ca60b70e49a08e90368000000000000000000000000fab44fbd00c5056956bc1c4d681a80563e10d2fd00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000c65d4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    );
  });

  it("should build a pre-validated signature", () => {
    expect(
      buildPrevalidatedSignature("0x9440850335c7C2a644dc2abEBBA93463c9736F2C"),
    ).toBe(
      "0x0000000000000000000000009440850335c7c2a644dc2abebba93463c9736f2c000000000000000000000000000000000000000000000000000000000000000001",
    );
  });
});
