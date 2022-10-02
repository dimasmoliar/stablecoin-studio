/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ITokenOwner,
  ITokenOwnerInterface,
} from "../../contracts/ITokenOwner";

const _abi = [
  {
    inputs: [],
    name: "getTokenAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenOwnerAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract HTSTokenOwner",
        name: "htsTokenOwnerAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "setTokenAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ITokenOwner__factory {
  static readonly abi = _abi;
  static createInterface(): ITokenOwnerInterface {
    return new utils.Interface(_abi) as ITokenOwnerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ITokenOwner {
    return new Contract(address, _abi, signerOrProvider) as ITokenOwner;
  }
}
