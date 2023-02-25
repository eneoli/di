import {ServiceLocator} from '../service-locator';
import {Constructor} from '../types/constructor';
import {CUSTOM_REFLECT_INJECT} from './reflection-constants';

export type InjectAllDecorator<T> = (tag: string) => (target: Constructor<unknown[], T>, propertyKey: string | symbol, parameterIndex: number) => void;

export function createInjectAllDecorator(di: ServiceLocator) {
	return function injectAll<T>(tag: string) {
		return function (target: Constructor<unknown[], T>, propertyKey: string | symbol, parameterIndex: number) {
			const customInjects = Reflect.getMetadata(CUSTOM_REFLECT_INJECT, target) || [];

			customInjects.push({
				position: parameterIndex,
				fetch: () => di.getByTag(tag),
			});

			Reflect.defineMetadata(CUSTOM_REFLECT_INJECT, customInjects, target);
		};
	};
}