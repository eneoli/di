import {BaseServiceFetchArgs, ServiceFetch} from '../service-description';

export interface ServiceDependency<TClass, TFetchArgs extends BaseServiceFetchArgs> {
	position: number;
	fetch: ServiceFetch<TClass, TFetchArgs>;
}