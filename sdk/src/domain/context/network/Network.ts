import { singleton } from 'tsyringe';

export type Environment =
	| 'testnet'
	| 'previewnet'
	| 'mainnet'
	| 'local'
	| string;

export interface NetworkProps {
	environment: Environment;
	mirrorNode?: string;
	rpcNode?: string;
	consensusNodes?: string;
}

@singleton()
export default class Network implements NetworkProps {
	environment: Environment;
	mirrorNode?: string;
	rpcNode?: string;
	consensusNodes?: string;

	constructor(props: NetworkProps) {
		Object.assign(this, props);
	}
}
