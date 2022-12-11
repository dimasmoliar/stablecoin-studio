/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import StableCoinCapabilities from '../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../../../src/domain/context/stablecoin/Capability.js';
import Account from '../../../../src/domain/context/account/Account.js';
import BigDecimal from '../../../../src/domain/context/shared/BigDecimal.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import { Wallet } from 'ethers';
import { StableCoinRole } from '../../../../src/domain/context/stablecoin/StableCoinRole.js';

describe('🧪 [BUILDER] RPCTransactionBuilder', () => {
	const clientPrivateKey =
		'1404d4a4a67fb21e7181d147bfdaa7c9b55ebeb7e1a9048bf18d5da6e169c09c';
	const evmAddress = '0x320d33046b60dbc5a027cfb7e4124f75b0417240';
	const accountFromAEvmAddress: Account = new Account({
		environment: 'testnet',		
		id: '0.0.48471385',
		evmAddress: evmAddress
	});
	const stableCoinCapabilitiesHTS = new StableCoinCapabilities(
		new StableCoin({
			name: 'HEDERACOIN',
			symbol: 'HTSECDSA',
			decimals: 6,
			proxyAddress: HederaId.from('0.0.49006492'),
			evmProxyAddress: '0x0000000000000000000000000000000002ebc79c',
			tokenId: HederaId.from('0.0.49006494'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.HTS),
			new Capability(Operation.BURN, Access.HTS),
			new Capability(Operation.WIPE, Access.HTS),
			new Capability(Operation.FREEZE, Access.HTS),
			new Capability(Operation.UNFREEZE, Access.HTS),
			new Capability(Operation.PAUSE, Access.HTS),
			new Capability(Operation.UNPAUSE, Access.HTS),
			new Capability(Operation.DELETE, Access.HTS),
			new Capability(Operation.RESCUE, Access.HTS),
			new Capability(Operation.ROLE_MANAGEMENT, Access.HTS),
		],
		accountFromAEvmAddress,
	);
	const stableCoinCapabilitiesSC = new StableCoinCapabilities(
		new StableCoin({
			name: 'SMARTCONTRACT',
			symbol: 'SMARTCONTRACT',
			decimals: 6,
			proxyAddress: HederaId.from('0.0.49006552'),
			evmProxyAddress: '0x0000000000000000000000000000000002ebc7d8',
			tokenId: HederaId.from('0.0.49006555'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.CONTRACT),
			new Capability(Operation.BURN, Access.CONTRACT),
			new Capability(Operation.WIPE, Access.CONTRACT),
			new Capability(Operation.FREEZE, Access.CONTRACT),
			new Capability(Operation.UNFREEZE, Access.CONTRACT),
			new Capability(Operation.PAUSE, Access.CONTRACT),
			new Capability(Operation.UNPAUSE, Access.CONTRACT),
			new Capability(Operation.DELETE, Access.CONTRACT),
			new Capability(Operation.RESCUE, Access.CONTRACT),
			new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
		],
		accountFromAEvmAddress,
	);

	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;
	beforeAll(async () => {
		th = new RPCTransactionAdapter();
		th.signerOrProvider = new Wallet(clientPrivateKey, th.provider);
	});

	it('Test wipe', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test mint', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			BigDecimal.fromString(
				'0.5',
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);
	}, 1500000);

	it('Test mint HTS', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			accountFromAEvmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test burn', async () => {
		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	// it('Test transfer', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	// });

	it('Test freeze', async () => {
		tr = await th.freeze(stableCoinCapabilitiesSC, accountFromAEvmAddress);
	}, 1500000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(stableCoinCapabilitiesSC, accountFromAEvmAddress);
	}, 1500000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilitiesSC);
		// console.log(tr);
	}, 1500000);

	it('Test rescue', async () => {
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test delete', async () => {
		tr = await th.delete(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test grantRole', async () => {
		tr = await th.grantRole(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test revokeRole', async () => {
		tr = await th.revokeRole(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test grantSupplierRole', async () => {
		tr = await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test grantUnlimitedSupplierRole', async () => {
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
		);
	}, 1500000);

	it('Test revokeSupplierRole', async () => {
		tr = await th.revokeSupplierRole(stableCoinCapabilitiesSC, accountFromAEvmAddress);
	}, 1500000);

	it('Test hasRole', async () => {
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			StableCoinRole.CASHIN_ROLE,
		);
		expect(typeof tr.response === 'boolean').toBeTruthy();
		console.log(tr);
	}, 1500000);

	it('Test getBalanceOf', async () => {
		tr = await th.balanceOf(stableCoinCapabilitiesSC, accountFromAEvmAddress);
		console.log(tr.response.toString());
	}, 1500000);

	it('Test isUnlimitedSupplierAllowance', async () => {
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
		);
		console.log(tr);
	}, 1500000);

	it('Test supplierAllowance', async () => {
		tr = await th.supplierAllowance(stableCoinCapabilitiesSC, accountFromAEvmAddress);
		console.log(tr.response.toString());
	}, 1500000);

	it('Test resetSupplierAllowance', async () => {
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
		);
	}, 1500000);

	it('Test increaseSupplierAllowance', async () => {
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test decreaseSupplierAllowance', async () => {
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			accountFromAEvmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test getRoles', async () => {
		tr = await th.getRoles(stableCoinCapabilitiesSC, accountFromAEvmAddress);
	}, 1500000);

	//  TODO To test
	it('Test associateToken', async () => {
		const account: Account = new Account({
			environment: 'testnet',
			id: '0.0.48517685',
			evmAddress: '0x367710d1076ed07d52162d3f45012a89f8bc3335'
		});
		tr = await th.associateToken(
			stableCoinCapabilitiesSC,
			account,
		);
		console.log(tr);
	}, 1500000);

	afterEach(async () => {
		// eslint-disable-next-line jest/no-standalone-expect
		expect(tr).not.toBeNull();
		// eslint-disable-next-line jest/no-standalone-expect
		expect(tr.error).toEqual(undefined);
		// 	const response: HTSResponse =
		// 		await HTSTransactionResponseHandler.manageResponse(
		// 			tr,
		// 			TransactionType.RECEIPT,
		// 			client,
		// 		);
		// 	expect(response.receipt?.status).toEqual(Status.Success);
	});
});
