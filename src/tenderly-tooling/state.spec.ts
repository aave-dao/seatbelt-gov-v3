import { describe, expect, it } from "vitest";
import type { StateDiff } from "@aave-dao/toolbox";
import { MOCK_SIMULATION } from "./mocks/mockSimulation";
import {
  renderMarkdownStateDiffReport,
  transformTenderlyStateDiff,
} from "./state";

describe("seatbelt:state", () => {
  it("should generate diff", async () => {
    expect(
      transformTenderlyStateDiff(
        MOCK_SIMULATION.transaction.transaction_info
          .state_diff as unknown as StateDiff[],
      ),
    ).toMatchInlineSnapshot(`
      {
        "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9": [
          {
            "after": {
              "configuration": {
                "data": "184449215279598567424000",
              },
            },
            "before": {
              "configuration": {
                "data": "184283194582935181459456",
              },
            },
            "key": "0x0000000000085d4780b73119b644ae5ecd22b376",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449503462729652895744",
              },
            },
            "before": {
              "configuration": {
                "data": "182623275799432407285760",
              },
            },
            "key": "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "46117221035194022100992",
              },
            },
            "before": {
              "configuration": {
                "data": "36893848998339246292992",
              },
            },
            "key": "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449503509974293479424",
              },
            },
            "before": {
              "configuration": {
                "data": "182623275846677047869440",
              },
            },
            "key": "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215279598141767680",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987616300896157696",
              },
            },
            "key": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449503509974293479424",
              },
            },
            "before": {
              "configuration": {
                "data": "182623275846677047869440",
              },
            },
            "key": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215278953896673280",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615656651063296",
              },
            },
            "key": "0x111111111117dc0aa78b770fa6a738034120c302",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215279598141767680",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987616300896157696",
              },
            },
            "key": "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215279168736460800",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615871490850816",
              },
            },
            "key": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "64563966842851127991328",
              },
            },
            "before": {
              "configuration": {
                "data": "55340594805996352183328",
              },
            },
            "key": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215279598141767680",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987616300896157696",
              },
            },
            "key": "0x408e41876cccdc0f92210600ef50372656052a38",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215278953896673280",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615656651063296",
              },
            },
            "key": "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449503462729652895744",
              },
            },
            "before": {
              "configuration": {
                "data": "184283482766066266931200",
              },
            },
            "key": "0x4fabb145d64652a948d72533023f6e7a623c7c53",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "64563825543271747158016",
              },
            },
            "before": {
              "configuration": {
                "data": "55340453506416971350016",
              },
            },
            "key": "0x514910771af9ca656af840dff83e8264ecf986ca",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "64563969612503201087488",
              },
            },
            "before": {
              "configuration": {
                "data": "55340597575648425279488",
              },
            },
            "key": "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "55340597575648425279488",
              },
            },
            "before": {
              "configuration": {
                "data": "46117225538793649471488",
              },
            },
            "key": "0x5f98805a4e8be255a32880fdec7f6728c6568ba0",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "55340597620316655328588",
              },
            },
            "before": {
              "configuration": {
                "data": "46117225583461879520588",
              },
            },
            "key": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "64563969612503201087488",
              },
            },
            "before": {
              "configuration": {
                "data": "55340597575648425279488",
              },
            },
            "key": "0x853d955acef822db058eb8505911ed77f175b99e",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215279598141767680",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987616300896157696",
              },
            },
            "key": "0x8798249c2e607446efb7ad49ec89dd1865ff4272",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "46117225538793649471488",
              },
            },
            "before": {
              "configuration": {
                "data": "36893853501938873663488",
              },
            },
            "key": "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449503509974293479424",
              },
            },
            "before": {
              "configuration": {
                "data": "182623275846677047869440",
              },
            },
            "key": "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215278524491366400",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615227245756416",
              },
            },
            "key": "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "55340594242831686442816",
              },
            },
            "before": {
              "configuration": {
                "data": "46117222205976910634816",
              },
            },
            "key": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449500085029932367872",
              },
            },
            "before": {
              "configuration": {
                "data": "182623272421732686757888",
              },
            },
            "key": "0xa693b19d2931d498c5b318df961919bb4aee87a5",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215278739148308480",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615441902698496",
              },
            },
            "key": "0xba100000625a3754423978a60c9317c58a424e3d",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215278524399943680",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615227154333696",
              },
            },
            "key": "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "55340597620746145505338",
              },
            },
            "before": {
              "configuration": {
                "data": "46117225583891369697338",
              },
            },
            "key": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215278739148308480",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615441902698496",
              },
            },
            "key": "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449500929454862499840",
              },
            },
            "before": {
              "configuration": {
                "data": "184283480232791476535296",
              },
            },
            "key": "0xd46ba6d942050d489dbd938a2c909a5d5039a161",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215278739239731200",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987615441994121216",
              },
            },
            "key": "0xd533a949740bb3306d119cc777fa900ba034cd52",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "55340594197948704751616",
              },
            },
            "before": {
              "configuration": {
                "data": "46117222161093928943616",
              },
            },
            "key": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449503509974293479424",
              },
            },
            "before": {
              "configuration": {
                "data": "182623275846677047869440",
              },
            },
            "key": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449215279598193868800",
              },
            },
            "before": {
              "configuration": {
                "data": "182622987616300948258816",
              },
            },
            "key": "0xe41d2489571d322189246dafa5ebde1f4699f498",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
          {
            "after": {
              "configuration": {
                "data": "184449503509974293479424",
              },
            },
            "before": {
              "configuration": {
                "data": "182623275846677047869440",
              },
            },
            "key": "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
            "name": "_reserves",
            "type": "mapping (address => tuple)",
          },
        ],
        "0xdAbad81aF85554E9ae636395611C58F7eC1aAEc5": [
          {
            "after": ""0x0065f066320065ef4eaf030157ab7ee15ce5ecacb1ab84ee42d5a9d0d8112922"",
            "before": ""0x0065f066320065ef4eaf020157ab7ee15ce5ecacb1ab84ee42d5a9d0d8112922"",
            "name": "0x35cf9ccc5fb50786824d0efe505d33216d9658f34614e7c25f0d5baeb2b0c672",
            "type": "raw",
          },
          {
            "after": ""0x000000000000000000093a80000001518000661d732f00000000000065f1b88b"",
            "before": ""0x000000000000000000093a80000001518000661d732f00000000000000000000"",
            "name": "0x35cf9ccc5fb50786824d0efe505d33216d9658f34614e7c25f0d5baeb2b0c673",
            "type": "raw",
          },
        ],
      }
    `);
  });

  it("should render a well readable report", async () => {
    expect(
      renderMarkdownStateDiffReport(
        transformTenderlyStateDiff(
          MOCK_SIMULATION.transaction.transaction_info
            .state_diff as unknown as StateDiff[],
        ),
      ),
    ).toMatchInlineSnapshot(`
      "#### 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9

      \`\`\`diff
      @@ \`_reserves\` mapping (address => tuple) key \`0x0000000000085d4780b73119b644ae5ecd22b376\`.configuration.data @@
      - "184283194582935181459456"
      + "184449215279598567424000"

      @@ \`_reserves\` mapping (address => tuple) key \`0x03ab458634910aad20ef5f1c8ee96f1d6ac54919\`.configuration.data @@
      - "182623275799432407285760"
      + "184449503462729652895744"

      @@ \`_reserves\` mapping (address => tuple) key \`0x056fd409e1d7a124bd7017459dfea2f387b6d5cd\`.configuration.data @@
      - "36893848998339246292992"
      + "46117221035194022100992"

      @@ \`_reserves\` mapping (address => tuple) key \`0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e\`.configuration.data @@
      - "182623275846677047869440"
      + "184449503509974293479424"

      @@ \`_reserves\` mapping (address => tuple) key \`0x0d8775f648430679a709e98d2b0cb6250d2887ef\`.configuration.data @@
      - "182622987616300896157696"
      + "184449215279598141767680"

      @@ \`_reserves\` mapping (address => tuple) key \`0x0f5d2fb29fb7d3cfee444a200298f468908cc942\`.configuration.data @@
      - "182623275846677047869440"
      + "184449503509974293479424"

      @@ \`_reserves\` mapping (address => tuple) key \`0x111111111117dc0aa78b770fa6a738034120c302\`.configuration.data @@
      - "182622987615656651063296"
      + "184449215278953896673280"

      @@ \`_reserves\` mapping (address => tuple) key \`0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b\`.configuration.data @@
      - "182622987616300896157696"
      + "184449215279598141767680"

      @@ \`_reserves\` mapping (address => tuple) key \`0x1f9840a85d5af5bf1d1762f925bdaddc4201f984\`.configuration.data @@
      - "182622987615871490850816"
      + "184449215279168736460800"

      @@ \`_reserves\` mapping (address => tuple) key \`0x2260fac5e5542a773aa44fbcfedf7c193bc2c599\`.configuration.data @@
      - "55340594805996352183328"
      + "64563966842851127991328"

      @@ \`_reserves\` mapping (address => tuple) key \`0x408e41876cccdc0f92210600ef50372656052a38\`.configuration.data @@
      - "182622987616300896157696"
      + "184449215279598141767680"

      @@ \`_reserves\` mapping (address => tuple) key \`0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b\`.configuration.data @@
      - "182622987615656651063296"
      + "184449215278953896673280"

      @@ \`_reserves\` mapping (address => tuple) key \`0x4fabb145d64652a948d72533023f6e7a623c7c53\`.configuration.data @@
      - "184283482766066266931200"
      + "184449503462729652895744"

      @@ \`_reserves\` mapping (address => tuple) key \`0x514910771af9ca656af840dff83e8264ecf986ca\`.configuration.data @@
      - "55340453506416971350016"
      + "64563825543271747158016"

      @@ \`_reserves\` mapping (address => tuple) key \`0x57ab1ec28d129707052df4df418d58a2d46d5f51\`.configuration.data @@
      - "55340597575648425279488"
      + "64563969612503201087488"

      @@ \`_reserves\` mapping (address => tuple) key \`0x5f98805a4e8be255a32880fdec7f6728c6568ba0\`.configuration.data @@
      - "46117225538793649471488"
      + "55340597575648425279488"

      @@ \`_reserves\` mapping (address => tuple) key \`0x6b175474e89094c44da98b954eedeac495271d0f\`.configuration.data @@
      - "46117225583461879520588"
      + "55340597620316655328588"

      @@ \`_reserves\` mapping (address => tuple) key \`0x853d955acef822db058eb8505911ed77f175b99e\`.configuration.data @@
      - "55340597575648425279488"
      + "64563969612503201087488"

      @@ \`_reserves\` mapping (address => tuple) key \`0x8798249c2e607446efb7ad49ec89dd1865ff4272\`.configuration.data @@
      - "182622987616300896157696"
      + "184449215279598141767680"

      @@ \`_reserves\` mapping (address => tuple) key \`0x8e870d67f660d95d5be530380d0ec0bd388289e1\`.configuration.data @@
      - "36893853501938873663488"
      + "46117225538793649471488"

      @@ \`_reserves\` mapping (address => tuple) key \`0x956f47f50a910163d8bf957cf5846d573e7f87ca\`.configuration.data @@
      - "182623275846677047869440"
      + "184449503509974293479424"

      @@ \`_reserves\` mapping (address => tuple) key \`0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2\`.configuration.data @@
      - "182622987615227245756416"
      + "184449215278524491366400"

      @@ \`_reserves\` mapping (address => tuple) key \`0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48\`.configuration.data @@
      - "46117222205976910634816"
      + "55340594242831686442816"

      @@ \`_reserves\` mapping (address => tuple) key \`0xa693b19d2931d498c5b318df961919bb4aee87a5\`.configuration.data @@
      - "182623272421732686757888"
      + "184449500085029932367872"

      @@ \`_reserves\` mapping (address => tuple) key \`0xba100000625a3754423978a60c9317c58a424e3d\`.configuration.data @@
      - "182622987615441902698496"
      + "184449215278739148308480"

      @@ \`_reserves\` mapping (address => tuple) key \`0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f\`.configuration.data @@
      - "182622987615227154333696"
      + "184449215278524399943680"

      @@ \`_reserves\` mapping (address => tuple) key \`0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2\`.configuration.data @@
      - "46117225583891369697338"
      + "55340597620746145505338"

      @@ \`_reserves\` mapping (address => tuple) key \`0xc18360217d8f7ab5e7c516566761ea12ce7f9d72\`.configuration.data @@
      - "182622987615441902698496"
      + "184449215278739148308480"

      @@ \`_reserves\` mapping (address => tuple) key \`0xd46ba6d942050d489dbd938a2c909a5d5039a161\`.configuration.data @@
      - "184283480232791476535296"
      + "184449500929454862499840"

      @@ \`_reserves\` mapping (address => tuple) key \`0xd533a949740bb3306d119cc777fa900ba034cd52\`.configuration.data @@
      - "182622987615441994121216"
      + "184449215278739239731200"

      @@ \`_reserves\` mapping (address => tuple) key \`0xdac17f958d2ee523a2206206994597c13d831ec7\`.configuration.data @@
      - "46117222161093928943616"
      + "55340594197948704751616"

      @@ \`_reserves\` mapping (address => tuple) key \`0xdd974d5c2e2928dea5f71b9825b8b646686bd200\`.configuration.data @@
      - "182623275846677047869440"
      + "184449503509974293479424"

      @@ \`_reserves\` mapping (address => tuple) key \`0xe41d2489571d322189246dafa5ebde1f4699f498\`.configuration.data @@
      - "182622987616300948258816"
      + "184449215279598193868800"

      @@ \`_reserves\` mapping (address => tuple) key \`0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c\`.configuration.data @@
      - "182623275846677047869440"
      + "184449503509974293479424"

      \`\`\`
      #### 0xdAbad81aF85554E9ae636395611C58F7eC1aAEc5

      \`\`\`diff
      @@ \`0x35cf9ccc5fb50786824d0efe505d33216d9658f34614e7c25f0d5baeb2b0c672\` raw  @@
      - "\\"0x0065f066320065ef4eaf020157ab7ee15ce5ecacb1ab84ee42d5a9d0d8112922\\""
      + "\\"0x0065f066320065ef4eaf030157ab7ee15ce5ecacb1ab84ee42d5a9d0d8112922\\""

      @@ \`0x35cf9ccc5fb50786824d0efe505d33216d9658f34614e7c25f0d5baeb2b0c673\` raw  @@
      - "\\"0x000000000000000000093a80000001518000661d732f00000000000000000000\\""
      + "\\"0x000000000000000000093a80000001518000661d732f00000000000065f1b88b\\""

      \`\`\`
      "
    `);
  });
});
