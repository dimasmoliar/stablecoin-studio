import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	ResetAllowanceCommand,
	ResetAllowanceCommandResponse,
} from './ResetAllowanceCommand.js';

@CommandHandler(ResetAllowanceCommand)
export class ResetAllowanceCommandHandler
	implements ICommandHandler<ResetAllowanceCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: ResetAllowanceCommand,
	): Promise<ResetAllowanceCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const coin = await this.stableCoinService.get(tokenId);
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			coin,
		);
		const res = await handler.resetSupplierAllowance(
			{
				account: account,
				capabilities: capabilities.capabilities,
				coin: coin,
			},
			targetId.value,
		);
		return Promise.resolve({ payload: res.response ?? false });
	}
}
