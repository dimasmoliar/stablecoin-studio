/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import Injectable from '../../../../../core/Injectable.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import {
	GetStableCoinQuery,
	GetStableCoinQueryResponse,
} from './GetStableCoinQuery.js';

@QueryHandler(GetStableCoinQuery)
export class GetStableCoinQueryHandler
	implements IQueryHandler<GetStableCoinQuery>
{
	constructor(
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNode: MirrorNodeAdapter,
		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
	) {}

	async execute(
		query: GetStableCoinQuery,
	): Promise<GetStableCoinQueryResponse> {
		const {tokenId} = query;
		const coin = await this.mirrorNode.getStableCoin(tokenId);
		const reserveAddress = await this.queryAdapter.getReserveAddress(
			tokenId.toString(),
		);
		// const reserveAmount = await this.queryAdapter.getReserveAmount(tokenId.toString())
		console.log(reserveAddress);

		return Promise.resolve(new GetStableCoinQueryResponse(coin));
	}
}