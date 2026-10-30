import { describe, expect, it } from "vitest";
import { MOCK_SIMULATION } from "./mocks/mockSimulation";
import { parseLogs } from "./logs";

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "factor",
        type: "uint256",
      },
    ],
    name: "ReserveFactorChanged",
    type: "event",
  },
] as const;

describe("seatbelt", () => {
  it("should decode known logs", () => {
    const logs = parseLogs({
      eventDb: abi,
      // the mock is a readonly literal, narrower than the tenderly response types
      logs: MOCK_SIMULATION.transaction.transaction_info.logs.map(
        (l) => l.raw,
      ) as unknown as Parameters<typeof parseLogs>[0]["logs"],
    });
    expect(logs).toMatchInlineSnapshot(`
      [
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x111111111117dC0aa78b770fA6A738034120C302",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000111111111117dc0aa78b770fa6a738034120c302",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000d46ba6d942050d489dbd938a2c909a5d5039a161",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000004fabb145d64652a948d72533023f6e7a623c7c53",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xba100000625a3754423978a60c9317c58a424e3D",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000ba100000625a3754423978a60c9317c58a424e3d",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000000d8775f648430679a709e98d2b0cb6250d2887ef",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xD533a949740bb3306d119CC777fa900bA034cd52",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000d533a949740bb3306d119cc777fa900ba034cd52",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000004e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            "factor": 3000n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000bb8",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000001494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000c18360217d8f7ab5e7c516566761ea12ce7f9d72",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000f629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000956f47f50a910163d8bf957cf5846d573e7f87ca",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x853d955aCEf822Db058eb8505911ED77F175b99e",
            "factor": 3500n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000dac",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000853d955acef822db058eb8505911ed77f175b99e",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd",
            "factor": 2500n,
          },
          "data": "0x00000000000000000000000000000000000000000000000000000000000009c4",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000056fd409e1d7a124bd7017459dfea2f387b6d5cd",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000dd974d5c2e2928dea5f71b9825b8b646686bd200",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
            "factor": 3500n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000dac",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
            "factor": 3000n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000bb8",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000000f5d2fb29fb7d3cfee444a200298f468908cc942",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000009f8f72aa9304c8b593d555f12ef6589cc3a579a2",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x00000000000000000000000003ab458634910aad20ef5f1c8ee96f1d6ac54919",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x408e41876cCCDC0F92210600ef50372656052a38",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000408e41876cccdc0f92210600ef50372656052a38",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
            "factor": 3500n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000dac",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000008798249c2e607446efb7ad49ec89dd1865ff4272",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x0000000000085d4780B73119b644AE5ecd22b376",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000000000000000085d4780b73119b644ae5ecd22b376",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "factor": 3000n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000bb8",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x8E870D67F660D95d5be530380D0eC0bd388289E1",
            "factor": 2500n,
          },
          "data": "0x00000000000000000000000000000000000000000000000000000000000009c4",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000008e870d67f660d95d5be530380d0ec0bd388289e1",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "factor": 3000n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000bb8",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xa693B19d2931d498c5B318dF961919BB4aee87a5",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000a693b19d2931d498c5b318df961919bb4aee87a5",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            "factor": 3500n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000dac",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "factor": 3000n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000bb8",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x0000000000000000000000000bc529c00c6401aef6d220be8c6ea1667f6ad93e",
          ],
        },
        {
          "address": "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
          "args": {
            "asset": "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
            "factor": 9999n,
          },
          "data": "0x000000000000000000000000000000000000000000000000000000000000270f",
          "eventName": "ReserveFactorChanged",
          "topics": [
            "0x2694ccb0b585b6a54b8d8b4a47aa874b05c257b43d34e98aee50838be00d3405",
            "0x000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498",
          ],
        },
        {
          "address": "0x5300a1a15135ea4dc7ad5a167152c01efc9b192a",
          "data": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000065f1b88b000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000009657865637574652829000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
          "topics": [
            "0x528c26f4cc05f95dc8bad30284946548f08ec44f7dd536473f28b08c65334cdd",
            "0x000000000000000000000000c7c080511adce1e4728ab4e28a31d97243d1c581",
          ],
        },
        {
          "address": "0xdabad81af85554e9ae636395611c58f7ec1aaec5",
          "data": "0x000000000000000000000000000000000000000000000000000000000000004f",
          "topics": [
            "0xda6084bb0aa902a7f6da10ba185d4aa129414651c90772417eff02a52112af2a",
          ],
        },
      ]
    `);
  });
});
