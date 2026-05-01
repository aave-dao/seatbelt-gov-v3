import { Address, Hex } from "viem";

export type CustomCall = {
  from: Address;
  target: Address;
  data: Hex;
  value?: bigint;
};

export type CustomSimulation = {
  preCalls?: CustomCall[];
  postCalls?: CustomCall[];
};

/**
 * Per-payload simulation wrappers, keyed `${chainId}:${controller.toLowerCase()}:${payloadId}`.
 *
 * When a payload depends on external state changes that the proposal itself does not
 * perform (e.g. a third party funding/approving an address before the payload can
 * execute), register pre/post calls here. Each call is executed on the simulation
 * fork from an impersonated `from` address; the standard `executePayload`
 * simulation runs in between.
 *
 * Prefer this over `SKIPPED_PAYLOADS` whenever the payload can be made to simulate
 * cleanly with a known setup.
 */
export const CUSTOM_SIMULATIONS: Record<string, CustomSimulation> = {
  "1:0xdabad81af85554e9ae636395611c58f7ec1aaec5:431": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x72Ac46CDFb53f076A7bEFFB355A67e903eCfa946",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x72Ac46CDFb53f076A7bEFFB355A67e903eCfa946",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
  "1:0xdabad81af85554e9ae636395611c58f7ec1aaec5:432": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x72Ac46CDFb53f076A7bEFFB355A67e903eCfa946",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x72Ac46CDFb53f076A7bEFFB355A67e903eCfa946",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:121": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:122": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:123": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:124": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:125": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:126": {
    preCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000001"
    }],
    postCalls:[{
      from: "0x53cb4BB8F61fa45405dC75F476FaDAd801e653D9",
      target: "0x830878a52c82E713570C4Ed025C6DCAEcF851f6D",
      data: "0x328d8f720000000000000000000000000000000000000000000000000000000000000000"
    }]
  },
};

export function getCustomSimulation(
  chainId: number,
  payloadsController: string,
  payloadId: number,
): CustomSimulation | undefined {
  return CUSTOM_SIMULATIONS[
    `${chainId}:${payloadsController.toLowerCase()}:${payloadId}`
  ];
}
