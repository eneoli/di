import {ServiceLocator} from './service-locator';
import {createInjectDecorator, InjectDecorator} from './decorators/create-inject-decorator';
import {createInjectAllDecorator, InjectAllDecorator} from './decorators/create-inject-all-decorator';
import {createServiceDecorator, ServiceDecorator} from './decorators/create-service-decorator';

interface ServiceContainerResult {
	di: ServiceLocator;
	Service: ServiceDecorator;
	inject: InjectDecorator<any>;
	injectAll: InjectAllDecorator<any>;
}

export function createServiceLocator(): ServiceContainerResult {
	const { di, resolve } = ServiceLocator.create();

	return {
		di: di,
		Service: createServiceDecorator(di, resolve),
		inject: createInjectDecorator(di),
		injectAll: createInjectAllDecorator(di),
	};
}