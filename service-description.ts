import {ServiceIdentifier} from './decorators/service-identifier';
import {ServiceDependency} from './types/service-dependency';
import {ServiceLocator} from './service-locator';

export interface BaseServiceFetchArgs {
	di: ServiceLocator;
	fetchChain: ServiceIdentifier<unknown>[];
}

export type ServiceFetch<TClass, TFetchArgs extends BaseServiceFetchArgs> = (args: TFetchArgs) => TClass;

export interface ServiceDescription<TClass, TFetchArgs extends BaseServiceFetchArgs> {
	serviceIdentifier: ServiceIdentifier<TClass>;
	dependencies: ServiceDependency<unknown, BaseServiceFetchArgs>[];
	tags: string[];
	fetch: ServiceFetch<TClass, TFetchArgs>;
}