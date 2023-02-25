import {BaseServiceFetchArgs, ServiceFetch} from './service-description';
import {ServiceIdentifier} from './decorators/service-identifier';

export function createServiceFetch<TClass, TServiceFetchArgs extends BaseServiceFetchArgs>({
																							   serviceIdentifier,
																							   serviceCreate,
																							   serviceStore,
																							   isSingleton,
																						   }: {
	serviceIdentifier: ServiceIdentifier<TClass>,
	serviceCreate: (args: TServiceFetchArgs) => TClass,
	serviceStore: Map<ServiceIdentifier<unknown>, unknown>,
	isSingleton: boolean
}): ServiceFetch<TClass, TServiceFetchArgs> {
	if (!isSingleton) {
		return serviceCreate;
	}

	return (args) => {
		let service = serviceStore.get(serviceIdentifier);

		if (!service) {
			service = serviceCreate(args);
			serviceStore.set(serviceIdentifier, service);
		}

		return service as TClass;
	};
}