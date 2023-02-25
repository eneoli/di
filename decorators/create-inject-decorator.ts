import {ServiceIdentifier} from './service-identifier';
import {Constructor} from '../types/constructor';
import {ServiceLocator} from '../service-locator';
import {CUSTOM_REFLECT_INJECT} from './reflection-constants';

export type InjectDecorator<T> = (serviceIdentifier: ServiceIdentifier<T>) => (target: Constructor<unknown[], T>, propertyKey: string | symbol, parameterIndex: number) => void;

export function createInjectDecorator(di: ServiceLocator) {
	return function inject<T>(serviceIdentifier: ServiceIdentifier<T>) {
		return function (target: Constructor<unknown[], T>, propertyKey: string | symbol, parameterIndex: number) {
			const customInjects = Reflect.getMetadata(CUSTOM_REFLECT_INJECT, target) || [];

			customInjects.push({
				position: parameterIndex,
				fetch: () => di.get(serviceIdentifier),
			});

			Reflect.defineMetadata(CUSTOM_REFLECT_INJECT, customInjects, target);
		};
	};
}