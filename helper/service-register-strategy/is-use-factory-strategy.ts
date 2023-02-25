import {
	ServiceRegisterStrategy,
	UseFactoryServiceRegisterStrategy,
} from '../../service-locator';

const USE_FACTORY_PROPERTY_NAME = 'useFactory';

export function isUseFactoryStrategy<T>(strategy: ServiceRegisterStrategy<T>): strategy is UseFactoryServiceRegisterStrategy<T> {
	return strategy.hasOwnProperty(USE_FACTORY_PROPERTY_NAME);
}