import {ServiceIdentifier} from './decorators/service-identifier';
import {BaseServiceFetchArgs, ServiceDescription} from './service-description';
import {ServiceLocatorError} from './exception/service-locator-error';
import {Constructor} from './types/constructor';
import {isUseValueStrategy} from './helper/service-register-strategy/is-use-value-strategy';
import {isUseFactoryStrategy} from './helper/service-register-strategy/is-use-factory-strategy';
import {createServiceFetch} from './service-fetch';
import {isUseClassStrategy} from './helper/service-register-strategy/is-use-class-strategy';
import {ServiceDependency} from './types/service-dependency';
import {isUndefined} from '../assertions/is-undefined';

// Service Register Strategies
type ServiceFactory<T> = (di: ServiceLocator) => T;

export type UseClassServiceRegisterStrategy<T> = { useClass: Constructor<any[], T> };
export type UseFactoryServiceRegisterStrategy<T> = { useFactory: ServiceFactory<T> };
export type UseValueServiceRegisterStrategy<T> = { useValue: T };

export type ServiceRegisterStrategy<T> =
	UseClassServiceRegisterStrategy<T>
	| UseFactoryServiceRegisterStrategy<T>
	| UseValueServiceRegisterStrategy<T>
	;
// ===

// custom options for service registration
interface RegisterServiceOptions {
	isSingleton?: boolean;
	tags?: string[];
}

export type ServiceResolver<T> = (serviceIdentifier: ServiceIdentifier<T>, fetchChain: ServiceIdentifier<unknown>[]) => unknown;

export class ServiceLocator {

	private serviceDescriptionMap = new Map<ServiceIdentifier<unknown>, ServiceDescription<unknown, BaseServiceFetchArgs>>();

	private serviceInstanceMap = new Map<ServiceIdentifier<unknown>, unknown>;

	private classServiceDependencyMap = new Map<Constructor<any[], any>, ServiceDependency<unknown, BaseServiceFetchArgs>[]>;

	public static create(): { di: ServiceLocator, resolve: ServiceResolver<any> } {

		const di = new ServiceLocator();

		return {
			di: di,
			resolve: di.resolve.bind(di),
		};
	}

	private getValue<T>(useValueStrategy: UseValueServiceRegisterStrategy<T>): T {
		return useValueStrategy.useValue;
	}

	private fabricate<T>(useFactoryStrategy: UseFactoryServiceRegisterStrategy<T>): T {
		return useFactoryStrategy.useFactory(this);
	}

	private instantiate<T>(serviceIdentifier: ServiceIdentifier<T>,
						   useClassStrategy: UseClassServiceRegisterStrategy<T>,
						   fetchArgs: BaseServiceFetchArgs): T {

		if (fetchArgs.fetchChain.includes(useClassStrategy.useClass)) {
			throw new ServiceLocatorError('Circular dependency');
		}

		const args = this.classServiceDependencyMap.get(useClassStrategy.useClass) || [];

		const services = [];
		for (const argument of args) {
			const service = argument.fetch({
				di: this,
				fetchChain: [serviceIdentifier, ...fetchArgs.fetchChain],
			});

			services.push(service);
		}

		return Reflect.construct(useClassStrategy.useClass, services);
	}

	private registerValueService<T>(serviceIdentifier: ServiceIdentifier<T>,
									valueStrategy: UseValueServiceRegisterStrategy<T>,
									options: RegisterServiceOptions) {

		this.serviceDescriptionMap.set(serviceIdentifier, {
			dependencies: [],
			tags: options.tags || [],
			serviceIdentifier: serviceIdentifier,
			fetch: createServiceFetch({
					serviceIdentifier: serviceIdentifier,
					serviceCreate: () => this.getValue(valueStrategy),
					serviceStore: this.serviceInstanceMap,
					isSingleton: !isUndefined(options.isSingleton) ? options.isSingleton : true,
				},
			),
		})
		;
	}

	private serviceIdentifierToString<T>(serviceIdentifier: ServiceIdentifier<T>): string {
		if (typeof serviceIdentifier === 'string') {
			return serviceIdentifier;
		}

		return serviceIdentifier?.name;
	}

	public setClassServiceDependencies<TArgs extends unknown[], TClass>(constructor: Constructor<TArgs, TClass>,
																		dependencies: ServiceDependency<any, any>[]) {
		this.classServiceDependencyMap.set(constructor, dependencies);
	}

	public getClassServiceDependencies<TArgs extends unknown[], TClass>(constructor: Constructor<TArgs, TClass>)
		: ServiceDependency<unknown, BaseServiceFetchArgs>[] | undefined {
		return this.classServiceDependencyMap.get(constructor);
	}

	private registerFactoryService<T>(serviceIdentifier: ServiceIdentifier<T>,
									  factoryStrategy: UseFactoryServiceRegisterStrategy<T>,
									  options: RegisterServiceOptions) {
		this.serviceDescriptionMap.set(serviceIdentifier, {
			dependencies: [],
			tags: options.tags || [],
			serviceIdentifier: serviceIdentifier,
			fetch: createServiceFetch({
				serviceIdentifier: serviceIdentifier,
				serviceCreate: () => this.fabricate(factoryStrategy),
				serviceStore: this.serviceInstanceMap,
				isSingleton: !isUndefined(options.isSingleton) ? options.isSingleton : true,
			}),
		});
	}

	private registerClassService<T>(serviceIdentifier: ServiceIdentifier<T>,
									classStrategy: UseClassServiceRegisterStrategy<T>,
									options: RegisterServiceOptions) {

		this.serviceDescriptionMap.set(serviceIdentifier, {
			dependencies: this.classServiceDependencyMap.get(classStrategy.useClass) || [],
			tags: options.tags || [],
			serviceIdentifier: serviceIdentifier,
			fetch: createServiceFetch({
				serviceIdentifier: serviceIdentifier,
				serviceCreate: (args) => this.instantiate(serviceIdentifier, classStrategy, args),
				serviceStore: this.serviceInstanceMap,
				isSingleton: !isUndefined(options.isSingleton) ? options.isSingleton : true,
			}),
		});

	}

	public register<T>(serviceIdentifier: ServiceIdentifier<T>,
					   serviceRegisterStrategy: ServiceRegisterStrategy<T>,
					   options: RegisterServiceOptions = {}) {

		if (this.serviceDescriptionMap.has(serviceIdentifier)) {
			throw new ServiceLocatorError(`Service ${this.serviceIdentifierToString(serviceIdentifier)} already registered!`);
		}

		// check strategy type

		if (isUseValueStrategy(serviceRegisterStrategy)) {
			return this.registerValueService(serviceIdentifier, serviceRegisterStrategy, options);
		}

		if (isUseFactoryStrategy(serviceRegisterStrategy)) {
			return this.registerFactoryService(serviceIdentifier, serviceRegisterStrategy, options);
		}

		if (isUseClassStrategy(serviceRegisterStrategy)) {
			return this.registerClassService(serviceIdentifier, serviceRegisterStrategy, options);
		}

		throw new ServiceLocatorError('Service creation strategy is not known.');

	}

	public hasService<T>(serviceIdentifier: ServiceIdentifier<T>): boolean {
		return this.serviceDescriptionMap.has(serviceIdentifier);
	}

	public resolve<T>(serviceIdentifier: ServiceIdentifier<T>, fetchChain: ServiceIdentifier<unknown>[]): T {
		const serviceDescription = this.serviceDescriptionMap.get(serviceIdentifier);

		if (fetchChain.includes(serviceIdentifier)) {
			throw new ServiceLocatorError('Circular dependency');
		}

		if (!serviceDescription) {
			throw new ServiceLocatorError(`Service ${this.serviceIdentifierToString(serviceIdentifier)} is unknown`);
		}

		return serviceDescription.fetch({ di: this, fetchChain: fetchChain }) as T;
	}

	public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
		return this.resolve(serviceIdentifier, []);
	}

	public getByTag<T>(tag: string): unknown[] {
		const services = [];
		for (const serviceDescription of this.serviceDescriptionMap.values()) {
			if (serviceDescription.tags.includes(tag)) {
				services.push(serviceDescription.fetch({
						di: this,
						fetchChain: [],
					},
				));
			}
		}

		return services;
	}
}