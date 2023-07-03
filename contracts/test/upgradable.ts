import { ValidationOptions } from '@openzeppelin/upgrades-core'
import { upgradeContract } from '../scripts/contractsLifeCycle/upgrade'
import {
    HederaTokenManager__factory,
    HederaTokenManager2__factory,
    ProxyAdmin__factory,
} from '../typechain-types'
import { Client, ContractId } from '@hashgraph/sdk'
import {
    deployContractsWithSDK,
    getNonOperatorAccount,
    getNonOperatorClient,
    getNonOperatorE25519,
    getOperatorAccount,
    getOperatorClient,
    getOperatorE25519,
    getOperatorPrivateKey,
    getOperatorPublicKey,
    initializeClients,
} from '../scripts/deploy'
import { clientId } from '../scripts/utils'
import { BigNumber } from 'ethers'

let proxyAddress: ContractId
let proxyAdminAddress: ContractId

let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const TokenDecimals = 3
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(10).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'
const abiProxyAdmin = ProxyAdmin__factory.abi
const MetadataString = 'Metadata_String'

describe('Upgradable Tests', function () {
    const validationOptions: ValidationOptions = {
        unsafeAllow: ['constructor'],
    }

    before(async function () {
        // Generate Client 1 and Client 2
        const [
            client1,
            client1account,
            client1privatekey,
            client1publickey,
            client1isED25519Type,
            client2,
            client2account,
            client2privatekey,
            client2publickey,
            client2isED25519Type,
        ] = initializeClients()

        operatorClient = getOperatorClient(client1, client2, clientId)
        nonOperatorClient = getNonOperatorClient(client1, client2, clientId)
        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        nonOperatorAccount = getNonOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )
        nonOperatorIsE25519 = getNonOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: TokenDecimals,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: BigNumber.from('2000').toString(),
        })

        proxyAddress = result[0]
        proxyAdminAddress = result[1]
    })

    /* it('Check contract', async () => {
        
        await validateUpgrade(
            HederaTokenManager__factory,
            HederaTokenManager__factory,
            validationOptions
        );
    }) */

    it.only('check contract bytecode', async () => {
        await upgradeContract(
            HederaTokenManager__factory.abi,
            HederaTokenManager__factory,
            validationOptions,
            operatorClient,
            operatorPriKey,
            proxyAdminAddress,
            proxyAddress.toSolidityAddress(),
            undefined,
            false,
            true
        )

        await upgradeContract(
            HederaTokenManager__factory.abi,
            HederaTokenManager2__factory,
            validationOptions,
            operatorClient,
            operatorPriKey,
            proxyAdminAddress,
            proxyAddress.toSolidityAddress(),
            undefined,
            false,
            true
        )
    })
})
