import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import {
  language,
  utilsService,
  wizardService,
  configurationService,
} from '../../../index.js';
import Service from '../Service.js';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import {
  RequestAccount,
  StableCoinRole,
  BurnRequest,
  GetAccountBalanceRequest,
  GetRolesRequest,
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
  FreezeAccountRequest,
  StableCoinCapabilities,
  Access,
  Operation,
  RequestPrivateKey,
  CashInRequest,
  WipeRequest,
  RescueRequest,
  IncreaseSupplierAllowanceRequest,
  CheckSupplierLimitRequest,
  DecreaseSupplierAllowanceRequest,
  ResetSupplierAllowanceRequest,
  PauseRequest,
  DeleteRequest,
  GetSupplierAllowanceRequest,
} from 'hedera-stable-coin-sdk';
import BalanceOfStableCoinsService from './BalanceOfStableCoinService.js';
import CashInStableCoinsService from './CashInStableCoinService.js';
import WipeStableCoinsService from './WipeStableCoinService.js';
import RoleStableCoinsService from './RoleStableCoinService.js';
import RescueStableCoinsService from './RescueStableCoinService.js';
import BurnStableCoinsService from './BurnStableCoinService.js';
import colors from 'colors';
import DeleteStableCoinService from './DeleteStableCoinService.js';
import PauseStableCoinService from './PauseStableCoinService.js';
import ManageImportedTokenService from './ManageImportedTokenService';
import FreezeStableCoinService from './FreezeStableCoinService.js';
import ListStableCoinsService from './ListStableCoinsService.js';
import CapabilitiesStableCoinService from './CapabilitiesStableCoinService.js';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;
  private proxyContractId;
  private stableCoinWithSymbol;
  private optionTokenListSelected;
  private roleStableCoinService = new RoleStableCoinsService();
  private capabilitiesStableCoinService = new CapabilitiesStableCoinService();
  private listStableCoinService = new ListStableCoinsService();
  private stableCoinPaused;
  private stableCoinDeleted;

  constructor(tokenId?: string, memo?: string, symbol?: string) {
    super('Operation Stable Coin');
    if (tokenId && memo && symbol) {
      this.stableCoinId = tokenId; //TODO Cambiar name por el id que llegue en la creación del token
      this.proxyContractId = memo;
      this.stableCoinWithSymbol = `${tokenId} - ${symbol}`;
    }
  }

  /**
   * Start the wizard for operation a stable coin
   */
  public async start(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    let coins: StableCoinList[];
    try {
      if (this.stableCoinId === undefined) {
        //Get list of stable coins to display
        const resp = await this.listStableCoinService.listStableCoins(false);
        coins = resp.coins;

        this.stableCoinId = await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.askToken'),
          new ManageImportedTokenService().mixImportedTokens(
            coins.map((item) => {
              return `${item.id} - ${item.symbol}`;
            }),
          ),
          true,
          configurationService.getConfiguration()?.defaultNetwork,
          `${configAccount.accountId} - ${configAccount.alias}`,
          this.stableCoinPaused,
          this.stableCoinDeleted,
        );
        this.optionTokenListSelected = this.stableCoinId;
        this.stableCoinWithSymbol =
          this.stableCoinId.split(' - ').length === 3
            ? `${this.stableCoinId.split(' - ')[0]} - ${
                this.stableCoinId.split(' - ')[1]
              }`
            : this.stableCoinId;
        this.stableCoinId = this.stableCoinId.split(' - ')[0];

        if (this.stableCoinId === language.getText('wizard.goBack')) {
          await utilsService.cleanAndShowBanner();
          await wizardService.mainMenu();
        } else {
          // Get details to obtain treasury
          await new DetailsStableCoinsService().getDetailsStableCoins(
            this.stableCoinId,
            false,
          );

          await utilsService.cleanAndShowBanner();
          await this.operationsStableCoin();
        }
      } else {
        await utilsService.cleanAndShowBanner();
        await this.operationsStableCoin();
      }
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.operationsStableCoin(),
        error,
      );
    }
  }

  private async operationsStableCoin(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    const privateKey: RequestPrivateKey = {
      key: configAccount.privateKey.key,
      type: configAccount.privateKey.type,
    };
    const currentAccount: RequestAccount = {
      accountId: configAccount.accountId,
      privateKey: privateKey,
    };

    const wizardOperationsStableCoinOptions = language.getArray(
      'wizard.stableCoinOptions',
    );

    const capabilitiesStableCoin: StableCoinCapabilities =
      await this.getCapabilities(currentAccount);

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askDoSomething'),
        this.filterMenuOptions(
          wizardOperationsStableCoinOptions,
          capabilitiesStableCoin,
          this.getRolesAccount(),
        ),
        false,
        configAccount.network,
        `${currentAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
        this.stableCoinPaused,
        this.stableCoinDeleted,
      )
    ) {
      case 'Cash in':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const cashInRequest = new CashInRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          amount: '',
        });

        // Call to mint
        cashInRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        await utilsService.handleValidation(
          () => cashInRequest.validate('targetId'),
          async () => {
            cashInRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId,
            );
          },
        );

        cashInRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askCashInAmount'), '1')
          .then((val) => val.replace(',', '.'));

        await utilsService.handleValidation(
          () => cashInRequest.validate('amount'),
          async () => {
            cashInRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askTargetAccount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );
        try {
          await new CashInStableCoinsService().cashInStableCoin(cashInRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case 'Details':
        await utilsService.cleanAndShowBanner();

        // Call to details
        await new DetailsStableCoinsService().getDetailsStableCoins(
          this.stableCoinId,
        );
        break;
      case 'Balance':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const getAccountBalanceRequest = new GetAccountBalanceRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });

        // Call to mint
        getAccountBalanceRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAccountToBalance'),
          currentAccount.accountId,
        );
        await utilsService.handleValidation(
          () => getAccountBalanceRequest.validate('targetId'),
          async () => {
            getAccountBalanceRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.askAccountToBalance'),
                currentAccount.accountId,
              );
          },
        );

        try {
          await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
            getAccountBalanceRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case 'Burn':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const cashOutRequest = new BurnRequest({
          tokenId: this.stableCoinId,
          amount: '',
        });

        cashOutRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askBurnAmount'), '1')
          .then((val) => val.replace(',', '.'));

        await utilsService.handleValidation(
          () => cashOutRequest.validate('amount'),
          async () => {
            cashOutRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askBurnAmount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );

        try {
          await new BurnStableCoinsService().burnStableCoin(cashOutRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case 'Wipe':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const wipeRequest = new WipeRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          amount: '',
        });

        // Call to wipe
        wipeRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        await utilsService.handleValidation(
          () => wipeRequest.validate('targetId'),
          async () => {
            wipeRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId,
            );
          },
        );

        wipeRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askWipeAmount'), '1')
          .then((val) => val.replace(',', '.'));

        await utilsService.handleValidation(
          () => wipeRequest.validate('amount'),
          async () => {
            wipeRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askWipeAmount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );
        try {
          await new WipeStableCoinsService().wipeStableCoin(wipeRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case 'Rescue':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const rescueRequest = new RescueRequest({
          tokenId: this.stableCoinId,
          amount: '',
        });

        let rescuedAmount = '';
        rescueRequest.amount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askRescueAmount'),
          '1',
        );
        await utilsService.handleValidation(
          () => rescueRequest.validate('amount'),
          async () => {
            rescuedAmount = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askRescueAmount'),
              '1',
            );
            rescueRequest.amount = rescuedAmount;
          },
        );

        // Call to Rescue
        try {
          await new RescueStableCoinsService().rescueStableCoin(rescueRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case 'Freeze an account':
        await utilsService.cleanAndShowBanner();
        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const freezeAccountRequest = new FreezeAccountRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });
        freezeAccountRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('wizard.freezeAccount'),
          '0.0.0',
        );

        await utilsService.handleValidation(
          () => freezeAccountRequest.validate('targetId'),
          async () => {
            freezeAccountRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('wizard.freezeAccount'),
              '0.0.0',
            );
          },
        );
        try {
          await new FreezeStableCoinService().freezeAccount(
            freezeAccountRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case 'Unfreeze an account':
        await utilsService.cleanAndShowBanner();
        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const unfreezeAccountRequest = new FreezeAccountRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });
        unfreezeAccountRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('wizard.unfreezeAccount'),
          '0.0.0',
        );

        await utilsService.handleValidation(
          () => unfreezeAccountRequest.validate('targetId'),
          async () => {
            unfreezeAccountRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('wizard.unfreezeAccount'),
                '0.0.0',
              );
          },
        );
        try {
          await new FreezeStableCoinService().unfreezeAccount(
            unfreezeAccountRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case 'Role management':
        await utilsService.cleanAndShowBanner();

        // Call to Supplier Role
        await this.roleManagementFlow();
        break;
      case 'Refresh roles':
        await utilsService.cleanAndShowBanner();

        const getRolesRequest = new GetRolesRequest({
          targetId: currentAccount.accountId,
          tokenId: this.stableCoinId,
        });

        // Call to Supplier Role
        const rolesToRefresh = await new RoleStableCoinsService().getRoles(
          getRolesRequest,
        );
        const importedTokensRefreshed = configAccount.importedTokens.map(
          (token) => {
            if (token.id === this.stableCoinId) {
              return {
                id: token.id,
                symbol: token.symbol,
                roles: rolesToRefresh,
              };
            }
            return token;
          },
        );
        new ManageImportedTokenService().updateAccount(importedTokensRefreshed);
        configAccount.importedTokens = importedTokensRefreshed;
        break;
      case colors.red('Danger zone'):
        await utilsService.cleanAndShowBanner();
        await this.dangerZone();
        break;
      case wizardOperationsStableCoinOptions[
        wizardOperationsStableCoinOptions.length - 1
      ]:
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
    }
    await this.operationsStableCoin();
  }

  private async getCapabilities(
    currentAccount: RequestAccount,
  ): Promise<StableCoinCapabilities> {
    return await this.capabilitiesStableCoinService.getCapabilitiesStableCoins(
      this.stableCoinId,
      currentAccount,
    );
  }

  /**
   * RoleManagement Flow
   */

  private async roleManagementFlow(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    const privateKey: RequestPrivateKey = {
      key: configAccount.privateKey.key,
      type: configAccount.privateKey.type,
    };
    const currentAccount: RequestAccount = {
      accountId: configAccount.accountId,
      privateKey: privateKey,
    };

    const stableCoinCapabilities = await this.getCapabilities(currentAccount);
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );

    const roleManagementOptions = language
      .getArray('wizard.roleManagementOptions')
      .filter((option) => {
        if (option == 'Edit role') {
          return capabilities.includes(Operation.CASH_IN);
        }

        return true;
      });

    const accountTarget = '0.0.0';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditCashInRole'),
        roleManagementOptions,
        false,
        configAccount.network,
        `${configAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
        this.stableCoinPaused,
        this.stableCoinDeleted,
      )
    ) {
      case 'Grant role':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        // Grant role
        //Lists all roles
        const grantRoleRequest = new GrantRoleRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(grantRoleRequest, [
          'tokenId'
        ]);

        grantRoleRequest.role = await this.getRole(stableCoinCapabilities);
        if (grantRoleRequest.role !== language.getText('wizard.goBack')) {
          await utilsService.handleValidation(
            () => grantRoleRequest.validate('role'),
            async () => {
              grantRoleRequest.role = await this.getRole(
                stableCoinCapabilities,
              );
            },
          );

          let grantAccountTargetId = accountTarget;
          grantRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => grantRoleRequest.validate('targetId'),
            async () => {
              grantAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              grantRoleRequest.targetId = grantAccountTargetId;
            },
          );

          try {
            if (grantRoleRequest.role === StableCoinRole.CASHIN_ROLE) {
              await this.grantSupplierRole(grantRoleRequest);
            } else {
              await this.roleStableCoinService.grantRoleStableCoin(
                grantRoleRequest,
              );
            }
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
        break;
      case 'Revoke role':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        // Revoke role
        //Lists all roles
        const revokeRoleRequest = new RevokeRoleRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(revokeRoleRequest, [
          'tokenId'
        ]);

        revokeRoleRequest.role = await this.getRole(stableCoinCapabilities);
        if (revokeRoleRequest.role !== language.getText('wizard.goBack')) {
          await utilsService.handleValidation(
            () => revokeRoleRequest.validate('role'),
            async () => {
              revokeRoleRequest.role = await this.getRole(
                stableCoinCapabilities,
              );
            },
          );

          let revokeAccountTargetId = accountTarget;
          revokeRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => revokeRoleRequest.validate('targetId'),
            async () => {
              revokeAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              revokeRoleRequest.targetId = revokeAccountTargetId;
            },
          );

          //Call to SDK
          try {
            await this.roleStableCoinService.revokeRoleStableCoin(
              revokeRoleRequest,
            );
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
        break;
      case 'Edit role':
        await utilsService.cleanAndShowBanner();

        //Call to edit role
        const editOptions = language.getArray('roleManagement.editAction');
        switch (
          await utilsService.defaultMultipleAsk(
            language.getText('roleManagement.askRole'),
            editOptions,
            false,
            configAccount.network,
            `${currentAccount.accountId} - ${configAccount.alias}`,
            this.stableCoinWithSymbol,
            this.stableCoinPaused,
            this.stableCoinDeleted,
          )
        ) {
          case editOptions[0]:
            await utilsService.cleanAndShowBanner();

            try {
              utilsService.displayCurrentUserInfo(
                configAccount,
                this.stableCoinWithSymbol,
              );

              //Increase limit
              const increaseCashInLimitRequest =
                new IncreaseSupplierAllowanceRequest({
                  tokenId: this.stableCoinId,
                  targetId: '',
                  amount: '',
                });

              await this.validateNotRequestedData(increaseCashInLimitRequest, [
                'tokenId'
              ]);

              let increaseCashInLimitTargetId = accountTarget;
              increaseCashInLimitRequest.targetId =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
              await utilsService.handleValidation(
                () => increaseCashInLimitRequest.validate('targetId'),
                async () => {
                  increaseCashInLimitTargetId =
                    await utilsService.defaultSingleAsk(
                      language.getText('stablecoin.accountTarget'),
                      accountTarget,
                    );
                  increaseCashInLimitRequest.targetId =
                    increaseCashInLimitTargetId;
                },
              );

              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: increaseCashInLimitRequest.targetId,
                    tokenId: increaseCashInLimitRequest.tokenId,
                    supplierType: 'unlimited',
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              if (
                !(await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: increaseCashInLimitRequest.targetId,
                    tokenId: increaseCashInLimitRequest.tokenId,
                    supplierType: 'limited',
                  }),
                ))
              ) {
                console.log(language.getText('cashin.notRole'));
                break;
              }

              let increaseAmount = '';
              increaseCashInLimitRequest.amount =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.amountIncrease'),
                  '1',
                );
              await utilsService.handleValidation(
                () => increaseCashInLimitRequest.validate('amount'),
                async () => {
                  increaseAmount = await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.amountIncrease'),
                    '1',
                  );
                  increaseCashInLimitRequest.amount = increaseAmount;
                },
              );
              //Call to SDK
              await this.roleStableCoinService.increaseLimitSupplierRoleStableCoin(
                increaseCashInLimitRequest,
              );

              await this.roleStableCoinService.getSupplierAllowance(
                new GetSupplierAllowanceRequest({
                  targetId: increaseCashInLimitRequest.targetId,
                  tokenId: increaseCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[1]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            //Decrease limit
            const decreaseCashInLimitRequest =
              new DecreaseSupplierAllowanceRequest({
                tokenId: this.stableCoinId,
                targetId: '',
                amount: '',
              });

            await this.validateNotRequestedData(decreaseCashInLimitRequest, [
              'tokenId'
            ]);

            let decreaseCashInLimitTargetId = accountTarget;
            decreaseCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
            await utilsService.handleValidation(
              () => decreaseCashInLimitRequest.validate('targetId'),
              async () => {
                decreaseCashInLimitTargetId =
                  await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.accountTarget'),
                    accountTarget,
                  );
                decreaseCashInLimitRequest.targetId =
                  decreaseCashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: decreaseCashInLimitRequest.targetId,
                    tokenId: decreaseCashInLimitRequest.tokenId,
                    supplierType: 'unlimited',
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              if (
                !(await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: decreaseCashInLimitRequest.targetId,
                    tokenId: decreaseCashInLimitRequest.targetId,
                    supplierType: 'limited',
                  }),
                ))
              ) {
                console.log(language.getText('cashin.notRole'));
                break;
              }

              let decreaseAmount = '';
              decreaseCashInLimitRequest.amount =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.amountDecrease'),
                  '1',
                );
              await utilsService.handleValidation(
                () => decreaseCashInLimitRequest.validate('amount'),
                async () => {
                  decreaseAmount = await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.amountDecrease'),
                    '1',
                  );
                  decreaseCashInLimitRequest.amount = decreaseAmount;
                },
              );

              await this.roleStableCoinService.decreaseLimitSupplierRoleStableCoin(
                decreaseCashInLimitRequest,
              );
              await this.roleStableCoinService.getSupplierAllowance(
                new GetSupplierAllowanceRequest({
                  targetId: decreaseCashInLimitRequest.targetId,
                  tokenId: decreaseCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[2]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            const resetCashInLimitRequest = new ResetSupplierAllowanceRequest({
              targetId: '',
              tokenId: this.stableCoinId,
            });

            //Reset
            let resetCashInLimitTargetId = accountTarget;
            resetCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
            await utilsService.handleValidation(
              () => resetCashInLimitRequest.validate('targetId'),
              async () => {
                resetCashInLimitTargetId = await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
                resetCashInLimitRequest.targetId = resetCashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: resetCashInLimitRequest.targetId,
                    tokenId: resetCashInLimitRequest.tokenId,
                    supplierType: 'unlimited',
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              //Call to SDK
              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: resetCashInLimitRequest.targetId,
                    tokenId: resetCashInLimitRequest.tokenId,
                    supplierType: 'limited',
                  }),
                )
              ) {
                await this.roleStableCoinService.resetLimitSupplierRoleStableCoin(
                  resetCashInLimitRequest,
                );
              } else {
                console.log(language.getText('cashin.notRole'));
              }
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[3]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            const checkCashInLimitRequest = new CheckSupplierLimitRequest({
              tokenId: this.stableCoinId,
              targetId: '',
            });

            await this.validateNotRequestedData(checkCashInLimitRequest, [
              'tokenId'
            ]);

            let cashInLimitTargetId = accountTarget;
            checkCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
            await utilsService.handleValidation(
              () => checkCashInLimitRequest.validate('targetId'),
              async () => {
                cashInLimitTargetId = await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
                checkCashInLimitRequest.targetId = cashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new GetSupplierAllowanceRequest({
                    targetId: checkCashInLimitRequest.targetId,
                    tokenId: checkCashInLimitRequest.tokenId,
                  }),
                )
              ) {
                const response = language.getText(
                  'roleManagement.accountHasRoleCashInUnlimited',
                );

                console.log(
                  response.replace('${address}', accountTarget) + '\n',
                );
                break;
              }
              await this.roleStableCoinService.getSupplierAllowance(
                new GetSupplierAllowanceRequest({
                  targetId: checkCashInLimitRequest.targetId,
                  tokenId: checkCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[editOptions.length - 1]:
          default:
            await utilsService.cleanAndShowBanner();

            await this.roleManagementFlow();
        }
        break;
      case 'Has role':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        //Lists all roles
        const hasRoleRequest = new HasRoleRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(hasRoleRequest, [
          'tokenId'
        ]);

        hasRoleRequest.role = await this.getRole(stableCoinCapabilities);
        if (hasRoleRequest.role !== language.getText('wizard.goBack')) {
          await utilsService.handleValidation(
            () => hasRoleRequest.validate('role'),
            async () => {
              hasRoleRequest.role = await this.getRole(stableCoinCapabilities);
            },
          );

          let hasRoleAccountTargetId = accountTarget;
          hasRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => hasRoleRequest.validate('targetId'),
            async () => {
              hasRoleAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              hasRoleRequest.targetId = hasRoleAccountTargetId;
            },
          );

          //Call to SDK
          try {
            await this.roleStableCoinService.hasRoleStableCoin(hasRoleRequest);
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
        break;
      case roleManagementOptions[roleManagementOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();

        await this.operationsStableCoin();
    }
    await this.roleManagementFlow();
  }

  private async validateNotRequestedData(
    request: any,
    params: string[],
  ): Promise<void> {
    for (let i = 0; i < params.length; i++) {
      await utilsService.handleValidation(
        () => request.validate(params[i]),
        async () => {
          await this.operationsStableCoin();
        },
      );
    }
  }

  private filterMenuOptions(
    options: string[],
    stableCoinCapabilities: StableCoinCapabilities,
    roles?: string[],
  ): string[] {
    let result = [];
    let capabilitiesFilter = [];
    if (stableCoinCapabilities.capabilities.length === 0) return options;
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );

    capabilitiesFilter = options.filter((option) => {
      if (
        (option === 'Cash in' && capabilities.includes(Operation.CASH_IN)) ||
        (option === 'Burn' && capabilities.includes(Operation.BURN)) ||
        (option === 'Wipe' && capabilities.includes(Operation.WIPE)) ||
        (option === 'Freeze an account' &&
          capabilities.includes(Operation.FREEZE)) ||
        (option === 'Unfreeze an account' &&
          capabilities.includes(Operation.UNFREEZE)) ||
        (option === colors.red('Danger zone') &&
          (capabilities.includes(Operation.PAUSE) ||
            capabilities.includes(Operation.DELETE))) ||
        (option === 'Role management' &&
          capabilities.includes(Operation.ROLE_MANAGEMENT)) ||
        (option === 'Refresh roles' && !this.stableCoinDeleted) ||
        (option === 'Details' && !this.stableCoinDeleted) ||
        (option === 'Balance' && !this.stableCoinDeleted)
      ) {
        return true;
      }
      return false;
    });

    result = roles
      ? capabilitiesFilter.filter((option) => {
          if (
            (option === 'Cash in' && roles.includes('CASH IN')) ||
            (option === 'Cash in' &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.CASH_IN,
                Access.HTS,
              )) ||
            (option === 'Burn' && roles.includes('BURN')) ||
            (option === 'Burn' &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.BURN,
                Access.HTS,
              )) ||
            (option === 'Wipe' && roles.includes('WIPE')) ||
            (option === 'Wipe' &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.WIPE,
                Access.HTS,
              )) ||
            (option === 'Freeze an account' && roles.includes('FREEZE')) ||
            (option === 'Freeze an account' &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.FREEZE,
                Access.HTS,
              )) ||
            (option === 'Unfreeze an account' && roles.includes('FREEZE')) ||
            (option === 'Unfreeze an account' &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.UNFREEZE,
                Access.HTS,
              )) ||
            (option === colors.red('Danger zone') && roles.includes('PAUSE')) ||
            (option === colors.red('Danger zone') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.PAUSE,
                Access.HTS,
              )) ||
            (option === colors.red('Danger zone') &&
              roles.includes('DELETE')) ||
            (option === colors.red('Danger zone') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.DELETE,
                Access.HTS,
              )) ||
            (option === 'Rescue' && roles.includes('RESCUE')) ||
            option === 'Refresh roles' ||
            option === 'Details' ||
            option === 'Balance'
          ) {
            return true;
          }
          return false;
        })
      : capabilitiesFilter;

    return result.concat(language.getArray('wizard.returnOption'));
  }

  private isOperationAccess(
    stableCoinCapabilities: StableCoinCapabilities,
    operation: Operation,
    access: Access,
  ): boolean {
    return stableCoinCapabilities.capabilities.some(
      (e) => e.operation === operation && e.access === access,
    );
  }

  private async getRole(
    stableCoinCapabilities: StableCoinCapabilities,
  ): Promise<any> {
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );
    const rolesAvailability = [
      {
        role: {
          availability: capabilities.includes(Operation.CASH_IN),
          name: 'Cash in Role',
          value: StableCoinRole.CASHIN_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.BURN),
          name: 'Burn Role',
          value: StableCoinRole.BURN_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.WIPE),
          name: 'Wipe Role',
          value: StableCoinRole.WIPE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.RESCUE),
          name: 'Rescue Role',
          value: StableCoinRole.RESCUE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.PAUSE),
          name: 'Pause Role',
          value: StableCoinRole.PAUSE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.FREEZE),
          name: 'Freeze Role',
          value: StableCoinRole.FREEZE_ROLE,
        },
      },
      {
        role: {
          // TODO Eliminar el DELETE HTS cuando se pueda eliminar desde contrato (SOLO para ver la opción)
          availability: capabilities.includes(Operation.DELETE),
          name: 'Delete Role',
          value: StableCoinRole.DELETE_ROLE,
        },
      },
    ];

    const rolesAvailable = rolesAvailability.filter(
      ({ role }) => role.availability,
    );
    const rolesNames = rolesAvailable.map(({ role }) => role.name);

    const roleSelected = await utilsService.defaultMultipleAsk(
      language.getText('roleManagement.askRole'),
      rolesNames,
      true,
    );
    if (roleSelected !== language.getText('wizard.goBack')) {
      const roleValue = rolesAvailable.filter(
        ({ role }) => role.name == roleSelected,
      )[0].role.value;
      return roleValue;
    }
    return roleSelected;
  }

  private getRolesAccount(): string[] {
    const configAccount = utilsService.getCurrentAccount();
    const roles =
      this.optionTokenListSelected &&
      this.optionTokenListSelected.split(' - ').length === 3
        ? configAccount.importedTokens.find(
            (token) => token.id === this.stableCoinId,
          ).roles
        : undefined;
    return roles;
  }

  private async grantSupplierRole(
    grantRoleRequest: GrantRoleRequest,
  ): Promise<void> {
    let hasRole;
    await utilsService.showSpinner(
      this.roleStableCoinService
        .hasRoleStableCoin(
          new HasRoleRequest({
            targetId: grantRoleRequest.targetId,
            tokenId: grantRoleRequest.tokenId,
            role: grantRoleRequest.role,
          }),
        )
        .then((response) => (hasRole = response[0])),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    if (hasRole) {
      console.log(language.getText('cashin.alreadyRole'));
    } else {
      let limit = '';
      const supplierRoleType = language.getArray('wizard.supplierRoleType');
      grantRoleRequest.supplierType = await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askCashInRoleType'),
        supplierRoleType,
      );
      await utilsService.handleValidation(
        () => grantRoleRequest.validate('supplierType'),
        async () => {
          const supplierType = await utilsService.defaultMultipleAsk(
            language.getText('stablecoin.askCashInRoleType'),
            supplierRoleType,
          );
          grantRoleRequest.supplierType = supplierType;
        },
      );

      if (
        grantRoleRequest.supplierType ===
        supplierRoleType[supplierRoleType.length - 1]
      )
        await this.roleManagementFlow();
      if (grantRoleRequest.supplierType === supplierRoleType[0]) {
        //Give unlimited
        //Call to SDK
        grantRoleRequest.supplierType = 'unlimited';
        await this.roleStableCoinService.giveSupplierRoleStableCoin(
          grantRoleRequest,
        );
      }
      if (grantRoleRequest.supplierType === supplierRoleType[1]) {
        grantRoleRequest.amount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.supplierRoleLimit'),
          '1',
        );
        await utilsService.handleValidation(
          () => grantRoleRequest.validate('amount'),
          async () => {
            limit = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.supplierRoleLimit'),
              '1',
            );
            grantRoleRequest.amount = limit;
          },
        );

        //Give limited
        //Call to SDK
        grantRoleRequest.supplierType = 'limited';
        await this.roleStableCoinService.giveSupplierRoleStableCoin(
          grantRoleRequest,
        );
      }
    }
  }

  private async checkSupplierType(
    req: CheckSupplierLimitRequest,
  ): Promise<boolean> {
    return await this.roleStableCoinService.checkCashInRoleStableCoin(req);
  }

  private async dangerZone(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    const privateKey: RequestPrivateKey = {
      key: configAccount.privateKey.key,
      type: configAccount.privateKey.type,
    };
    const currentAccount: RequestAccount = {
      accountId: configAccount.accountId,
      privateKey: privateKey,
    };

    const stableCoinCapabilities = await this.getCapabilities(currentAccount);
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );

    const rolesAccount = this.getRolesAccount();
    const dangerZoneOptions = language
      .getArray('dangerZone.options')
      .filter((option) => {
        switch (option) {
          case 'Pause stable coin':
          case 'Unpause stable coin':
            let showPauser: boolean =
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.PAUSE,
                Access.HTS,
              ) &&
              (option == 'Pause stable coin'
                ? !this.stableCoinPaused
                : this.stableCoinPaused);
            if (showPauser && rolesAccount) {
              showPauser = rolesAccount.includes('PAUSE');
            }
            return showPauser;
            break;
          case 'Delete stable coin':
            let showDelete: boolean = capabilities.includes(Operation.DELETE);
            if (showDelete && rolesAccount) {
              showDelete = rolesAccount.includes('DELETE');
            }
            return showDelete;
            break;
        }
        // TODO DELETE STABLE COIN
        return true;
      });

    // const accountTarget = '0.0.0';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditCashInRole'),
        dangerZoneOptions,
        false,
        configAccount.network,
        `${configAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
        this.stableCoinPaused,
        this.stableCoinDeleted,
      )
    ) {
      case 'Pause stable coin':
        const confirmPause = await utilsService.defaultConfirmAsk(
          language.getText('dangerZone.confirmPause'),
          true,
        );
        if (confirmPause) {
          try {
            const req = new PauseRequest({
              tokenId: this.stableCoinId,
            });
            await new PauseStableCoinService().pauseStableCoin(req);
            this.stableCoinPaused = true;
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }

        break;
      case 'Unpause stable coin':
        const confirmUnpause = await utilsService.defaultConfirmAsk(
          language.getText('dangerZone.confirmUnpause'),
          true,
        );
        if (confirmUnpause) {
          try {
            const req = new PauseRequest({
              tokenId: this.stableCoinId,
            });
            await new PauseStableCoinService().unpauseStableCoin(req);
            this.stableCoinPaused = false;
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }

        break;
      case 'Delete stable coin':
        const confirmDelete = await utilsService.defaultConfirmAsk(
          language.getText('dangerZone.confirmDelete'),
          true,
        );
        if (confirmDelete) {
          try {
            const req = new DeleteRequest({
              account: {
                accountId: currentAccount.accountId,
                privateKey: {
                  key: currentAccount.privateKey.key,
                  type: currentAccount.privateKey.type,
                },
              },
              proxyContractId: this.proxyContractId,
              tokenId: this.stableCoinId,
            });

            await new DeleteStableCoinService().deleteStableCoin(req);
            this.stableCoinDeleted = true;
            await wizardService.mainMenu();
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
        break;
      case dangerZoneOptions[dangerZoneOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();
        await this.operationsStableCoin();
    }
    await this.dangerZone();
  }
}
