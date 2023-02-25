import {
	ServiceRegisterStrategy,
	UseValueServiceRegisterStrategy,
} from '../../service-locator';

const USE_VALUE_PROPERTY_NAME = 'useValue';

export function isUseValueStrategy<T>(strategy: ServiceRegisterStrategy<T>): strategy is UseValueServiceRegisterStrategy<T> {
	return strategy.hasOwnProperty(USE_VALUE_PROPERTY_NAME);
}