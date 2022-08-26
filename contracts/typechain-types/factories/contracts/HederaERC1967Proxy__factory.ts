/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  PayableOverrides,
  BytesLike,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  HederaERC1967Proxy,
  HederaERC1967ProxyInterface,
} from "../../contracts/HederaERC1967Proxy";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_logic",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousAdmin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beacon",
        type: "address",
      },
    ],
    name: "BeaconUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "getImplementation",
    outputs: [
      {
        internalType: "address",
        name: "impl",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x608060405260405162000d3138038062000d3183398181016040528101906200002991906200056e565b81816200003f828260006200004960201b60201c565b50505050620007eb565b6200005a836200008c60201b60201c565b600082511180620000685750805b156200008757620000858383620000e360201b6200008f1760201c565b505b505050565b6200009d816200011960201b60201c565b8073ffffffffffffffffffffffffffffffffffffffff167fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b60405160405180910390a250565b606062000111838360405180606001604052806027815260200162000d0a60279139620001ef60201b60201c565b905092915050565b6200012f81620002d360201b620000bc1760201c565b62000171576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040162000168906200065b565b60405180910390fd5b80620001ab7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b620002f660201b620000df1760201c565b60000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60606200020284620002d360201b60201c565b62000244576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200023b90620006f3565b60405180910390fd5b6000808573ffffffffffffffffffffffffffffffffffffffff16856040516200026e919062000762565b600060405180830381855af49150503d8060008114620002ab576040519150601f19603f3d011682016040523d82523d6000602084013e620002b0565b606091505b5091509150620002c88282866200030060201b60201c565b925050509392505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b6000819050919050565b60608315620003125782905062000365565b600083511115620003265782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200035c9190620007c7565b60405180910390fd5b9392505050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620003ad8262000380565b9050919050565b620003bf81620003a0565b8114620003cb57600080fd5b50565b600081519050620003df81620003b4565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200043a82620003ef565b810181811067ffffffffffffffff821117156200045c576200045b62000400565b5b80604052505050565b6000620004716200036c565b90506200047f82826200042f565b919050565b600067ffffffffffffffff821115620004a257620004a162000400565b5b620004ad82620003ef565b9050602081019050919050565b60005b83811015620004da578082015181840152602081019050620004bd565b83811115620004ea576000848401525b50505050565b600062000507620005018462000484565b62000465565b905082815260208101848484011115620005265762000525620003ea565b5b62000533848285620004ba565b509392505050565b600082601f830112620005535762000552620003e5565b5b815162000565848260208601620004f0565b91505092915050565b6000806040838503121562000588576200058762000376565b5b60006200059885828601620003ce565b925050602083015167ffffffffffffffff811115620005bc57620005bb6200037b565b5b620005ca858286016200053b565b9150509250929050565b600082825260208201905092915050565b7f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60008201527f6f74206120636f6e747261637400000000000000000000000000000000000000602082015250565b600062000643602d83620005d4565b91506200065082620005e5565b604082019050919050565b60006020820190508181036000830152620006768162000634565b9050919050565b7f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f60008201527f6e74726163740000000000000000000000000000000000000000000000000000602082015250565b6000620006db602683620005d4565b9150620006e8826200067d565b604082019050919050565b600060208201905081810360008301526200070e81620006cc565b9050919050565b600081519050919050565b600081905092915050565b6000620007388262000715565b62000744818562000720565b935062000756818560208601620004ba565b80840191505092915050565b60006200077082846200072b565b915081905092915050565b600081519050919050565b600062000793826200077b565b6200079f8185620005d4565b9350620007b1818560208601620004ba565b620007bc81620003ef565b840191505092915050565b60006020820190508181036000830152620007e3818462000786565b905092915050565b61050f80620007fb6000396000f3fe6080604052600436106100225760003560e01c8063aaf10f421461003b57610031565b366100315761002f610066565b005b610039610066565b005b34801561004757600080fd5b50610050610080565b60405161005d91906102ec565b60405180910390f35b61006e6100e9565b61007e6100796100eb565b6100fa565b565b600061008a6100eb565b905090565b60606100b483836040518060600160405280602781526020016104b360279139610120565b905092915050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b6000819050919050565b565b60006100f56101ed565b905090565b3660008037600080366000845af43d6000803e806000811461011b573d6000f35b3d6000fd5b606061012b846100bc565b61016a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101619061038a565b60405180910390fd5b6000808573ffffffffffffffffffffffffffffffffffffffff16856040516101929190610424565b600060405180830381855af49150503d80600081146101cd576040519150601f19603f3d011682016040523d82523d6000602084013e6101d2565b606091505b50915091506101e2828286610244565b925050509392505050565b600061021b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b6100df565b60000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60608315610254578290506102a4565b6000835111156102675782518084602001fd5b816040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161029b9190610490565b60405180910390fd5b9392505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102d6826102ab565b9050919050565b6102e6816102cb565b82525050565b600060208201905061030160008301846102dd565b92915050565b600082825260208201905092915050565b7f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f60008201527f6e74726163740000000000000000000000000000000000000000000000000000602082015250565b6000610374602683610307565b915061037f82610318565b604082019050919050565b600060208201905081810360008301526103a381610367565b9050919050565b600081519050919050565b600081905092915050565b60005b838110156103de5780820151818401526020810190506103c3565b838111156103ed576000848401525b50505050565b60006103fe826103aa565b61040881856103b5565b93506104188185602086016103c0565b80840191505092915050565b600061043082846103f3565b915081905092915050565b600081519050919050565b6000601f19601f8301169050919050565b60006104628261043b565b61046c8185610307565b935061047c8185602086016103c0565b61048581610446565b840191505092915050565b600060208201905081810360008301526104aa8184610457565b90509291505056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a26469706673582212204688261a298825cf029c6d759848fa2761d4a21acdeb809ab24b980e362b925b64736f6c634300080a0033416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564";

type HederaERC1967ProxyConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: HederaERC1967ProxyConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class HederaERC1967Proxy__factory extends ContractFactory {
  constructor(...args: HederaERC1967ProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _logic: PromiseOrValue<string>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<HederaERC1967Proxy> {
    return super.deploy(
      _logic,
      _data,
      overrides || {}
    ) as Promise<HederaERC1967Proxy>;
  }
  override getDeployTransaction(
    _logic: PromiseOrValue<string>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_logic, _data, overrides || {});
  }
  override attach(address: string): HederaERC1967Proxy {
    return super.attach(address) as HederaERC1967Proxy;
  }
  override connect(signer: Signer): HederaERC1967Proxy__factory {
    return super.connect(signer) as HederaERC1967Proxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): HederaERC1967ProxyInterface {
    return new utils.Interface(_abi) as HederaERC1967ProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): HederaERC1967Proxy {
    return new Contract(address, _abi, signerOrProvider) as HederaERC1967Proxy;
  }
}