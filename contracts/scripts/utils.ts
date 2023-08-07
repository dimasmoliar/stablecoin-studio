/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Client,
    TokenCreateTransaction,
    DelegateContractId,
    Hbar,
    AccountId,
    PrivateKey,
    PublicKey,
    TokenSupplyType,
    TokenId,
    TokenAssociateTransaction,
    TokenDissociateTransaction,
    TransferTransaction,
    TransactionResponse,
    ContractId,
    ContractCreateFlow,
} from '@hashgraph/sdk'

import Web3 from 'web3'
import axios from 'axios'
import { ADDRESS_0 } from './constants'
import { BigNumber } from 'ethers'
import { string } from 'hardhat/internal/core/params/argumentTypes.js'

const web3 = new Web3()
const SuccessStatus = 22

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

export const clientId = 1

async function checkTxResponse(
    txResponse: TransactionResponse,
    clientOperator: Client
) {
    const receipt = await txResponse.getReceipt(clientOperator)

    //Get the transaction consensus status
    const transactionStatus = receipt.status

    if (transactionStatus._code !== SuccessStatus) {
        throw new Error(transactionStatus._code.toString())
    }
}

export async function associateToken(
    tokenId: string,
    targetId: string,
    clientOperator: Client
) {
    const txResponse = await new TokenAssociateTransaction()
        .setTokenIds([tokenId])
        .setAccountId(targetId)
        .execute(clientOperator)

    await checkTxResponse(txResponse, clientOperator)
}

export async function dissociateToken(
    tokenId: string,
    targetId: string,
    clientOperator: Client
) {
    const txResponse = await new TokenDissociateTransaction()
        .setTokenIds([tokenId])
        .setAccountId(targetId)
        .execute(clientOperator)

    await checkTxResponse(txResponse, clientOperator)
}

export async function transferToken(
    tokenId: string,
    targetId: string,
    amount: BigNumber,
    clientOperator: Client
) {
    const txResponse = await new TransferTransaction()
        .addTokenTransfer(tokenId, targetId, amount.toNumber())
        .addTokenTransfer(
            tokenId,
            clientOperator.operatorAccountId!.toString(),
            -1 * amount.toNumber()
        )
        .execute(clientOperator)

    await checkTxResponse(txResponse, clientOperator)
}

export function oneYearLaterInSeconds(): number {
    const currentDate: Date = new Date()
    return Math.floor(
        currentDate.setFullYear(currentDate.getFullYear() + 1) / 1000
    )
}

export function getClient(network?: string): Client {
    if (!network) {
        const hre = require('hardhat')
        network = hre.network.name
    }
    switch (network) {
        case 'previewnet':
            return Client.forPreviewnet()
            break
        case 'mainnet':
            return Client.forMainnet()
            break
        default:
        case 'testnet':
            return Client.forTestnet()
            break
    }
}

export async function createToken(
    contractId: string,
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply: number,
    maxSupply: number | null,
    memo: string,
    freeze = false,
    accountId: string,
    privateKey: string,
    publicKey: string,
    clientSdk: Client
): Promise<TokenId | null> {
    const transaction = new TokenCreateTransaction()
        .setMaxTransactionFee(new Hbar(25))
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setDecimals(decimals)
        .setInitialSupply(initialSupply)
        .setTokenMemo(memo)
        .setFreezeDefault(freeze)
        .setTreasuryAccountId(AccountId.fromString(contractId.toString()))
        .setAdminKey(PublicKey.fromString(publicKey))
        .setFreezeKey(DelegateContractId.fromString(contractId))
        .setWipeKey(DelegateContractId.fromString(contractId))
        .setPauseKey(DelegateContractId.fromString(contractId))
        .setSupplyKey(DelegateContractId.fromString(contractId))

    if (maxSupply !== null) {
        transaction.setSupplyType(TokenSupplyType.Finite)
        transaction.setMaxSupply(maxSupply)
    }
    transaction.freezeWith(clientSdk)

    const transactionSign = await transaction.sign(
        PrivateKey.fromStringED25519(privateKey)
    )
    const txResponse = await transactionSign.execute(clientSdk)
    const receipt = await txResponse.getReceipt(clientSdk)
    const tokenId = receipt.tokenId
    console.log(
        `Token ${name} created tokenId ${tokenId} - tokenAddress ${tokenId?.toSolidityAddress()}   `
    )
    return tokenId
}

export async function deployContractSDK(
    factory: any,
    privateKey: string,
    clientOperator: Client,
    constructorParameters?: any,
    adminKey?: PrivateKey,
    contractMemo?: string
): Promise<ContractId> {
    const transaction = new ContractCreateFlow()
        .setBytecode(factory.bytecode)
        .setGas(250_000)
    //.setAdminKey(Key)
    if (contractMemo) {
        transaction.setContractMemo(contractMemo)
    }
    if (constructorParameters) {
        transaction.setConstructorParameters(constructorParameters)
    }

    const contractCreateSign = await transaction.sign(
        PrivateKey.fromStringED25519(privateKey)
    )

    const txResponse = await contractCreateSign.execute(clientOperator)
    await sleep(2000)
    const receipt = await txResponse.getReceipt(clientOperator)
    await sleep(2000)
    const contractId = receipt.contractId
    if (!contractId) {
        throw Error('Error deploying contractSDK')
    }
    console.log(
        ` ${factory.name} - contractId ${contractId} -contractId ${
            (await getContractInfo(contractId.toString())).evm_address
        }   `
    )
    return contractId
}

export async function toEvmAddress(
    accountId: string,
    isE25519: boolean
): Promise<string> {
    try {
        if (isE25519)
            return '0x' + AccountId.fromString(accountId).toSolidityAddress()

        const URI_BASE = `${getHederaNetworkMirrorNodeURL()}/api/v1/`
        const url = URI_BASE + 'accounts/' + accountId
        const res = await axios.get<IAccount>(url)
        return res.data.evm_address
    } catch (error) {
        throw new Error('Error retrieving the Evm Address : ' + error)
    }
}

export async function getContractInfo(contractId: string): Promise<IContract> {
    try {
        const URI_BASE = `${getHederaNetworkMirrorNodeURL()}/api/v1/`
        const url = URI_BASE + 'contracts/' + contractId

        console.log(url)
        const retry = 10
        let i = 0
        let res = null
        do {
            res = await axios.get<IContract>(url)
            i++
            await sleep(1000)
        } while (res.status !== 200 && i < retry)

        return res.data
    } catch (error) {
        throw new Error('Error retrieving the Evm Address : ' + error)
    }
}

export async function evmToHederaFormat(evmAddress: string): Promise<string> {
    if (evmAddress === ADDRESS_0) return '0.0.0'
    const URI_BASE = `${getHederaNetworkMirrorNodeURL()}/api/v1/`
    const url = URI_BASE + 'accounts/' + evmAddress
    const res = await axios.get<IAccount>(url)
    return res.data.account
}

interface IAccount {
    evm_address: string
    key: IKey
    account: string
}

interface IContract {
    admin_key: IKey
    nullable: boolean
    auto_renew_account: string
    auto_renew_period: string
    contract_id: string
    created_timestamp: string
    deleted: string
    evm_address: string
    expiration_timestamp: string
    file_id: string
    max_automatic_token_associations: string
    memo: string
    obtainer_id: string
    permanent_removal: string
    proxy_account_id: string
    timestamp: string
}

interface IKey {
    _type: string
    key: string
}

function getHederaNetworkMirrorNodeURL(network?: string): string {
    if (!network) {
        const hre = require('hardhat')
        network = hre.network.name
    }
    switch (network) {
        case 'mainnet':
            return 'https://mainnet-public.mirrornode.hedera.com'
        case 'previewnet':
            return 'https://previewnet.mirrornode.hedera.com'
        case 'testnet':
            return 'https://testnet.mirrornode.hedera.com'
        default:
            return 'https://testnet.mirrornode.hedera.com'
    }
}
