import {Constructor} from '../types/constructor';
import {ServiceLocator} from '../service-locator';
import {ServiceDependency} from '../types/service-dependency';
import {BaseServiceFetchArgs} from '../service-description';
import {ServiceIdentifier} from './service-identifier';
import {CUSTOM_REFLECT_INJECT} from './reflection-constants';

interface ServiceOptions {
	isSingleton?: boolean;
	tags?: string[];
}

type ServiceResolver<T> = (serviceIdentifier: ServiceIdentifier<T>, fetchChain: ServiceIdentifier<unknown>[]) => unknown;

export type ServiceDecorator = (options?: ServiceOptions | undefined) => (constructor: Constructor<any[], any>) => void;

export function createServiceDecorator(di: ServiceLocator, resolve: ServiceResolver<unknown>): ServiceDecorator {
	return function Service(options: ServiceOptions | undefined = undefined) {

		return (constructor: Constructor<any[], any>) => {
			const params = Reflect.getMetadata('design:paramtypes', constructor) || [];

			const serviceDependencies: ServiceDependency<unknown, BaseServiceFetchArgs>[] = [];

			for (let i = 0; i < params.length; i++) {
				const param = params[i];

				serviceDependencies.push({
					position: i,
					fetch: ({ fetchChain }) => resolve(param, fetchChain),
				});
			}

			const customInjects = Reflect.getMetadata(CUSTOM_REFLECT_INJECT, constructor) || [];

			for (const customInject of customInjects) {
				serviceDependencies[customInject.position] = customInject;
			}

			di.setClassServiceDependencies(constructor, serviceDependencies);

			// register class as service
			di.register(constructor, { useClass: constructor }, {
				tags: options?.tags,
				isSingleton: options?.isSingleton,
			});
		};
	};
}