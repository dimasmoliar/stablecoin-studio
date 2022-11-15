import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { DecreaseCashInLimitRequest } from '../../../../../src/index.js';
import { EXAMPLE_TOKEN, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK Decrease Cash In Limit Request', () => {
  it('Create simple request', () => {
    const request: DecreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: '',
      proxyContractId: '',
      tokenId: '',
      amount: '1'      
    });
    expect(request).not.toBeNull();
  });

  it('Decrease cash in role limit and validate', () => {
    const request: DecreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      amount: '1'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Decrease cash in role limit and validate simple request with decimals', () => {
    const request: DecreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      amount: '1.456'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: DecreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      amount: 'amount'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.InvalidType);
  });

  it('Create and validate request [amount]', () => {
    const request: DecreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      amount: 'amount'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toBe(1);
    request.amount = '1000';
    const validationsOk = request.validate();
    expect(validationsOk.length).toBe(0);
  });

  it('Create and validate request, fail with [amount, target]', () => {
    const request: DecreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: 'targetId',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      amount: 'amount',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(2);
  });
  it('Create and validate request, fail with [amount, target, tokenId]', () => {
    const request: DecreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: 'targetId',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: 'tokenId',
      amount: 'amount'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(3);
  });
});