/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IBurnable,
  IBurnableInterface,
} from "../../../../contracts/extensions/Interfaces/IBurnable";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "burner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensBurned",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IBurnable__factory {
  static readonly abi = _abi;
  static createInterface(): IBurnableInterface {
    return new utils.Interface(_abi) as IBurnableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBurnable {
    return new Contract(address, _abi, signerOrProvider) as IBurnable;
  }
}