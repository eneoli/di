import {
	ServiceRegisterStrategy,
	UseClassServiceRegisterStrategy,
} from '../../service-locator';

const USE_CLASS_PROPERTY_NAME = 'useClass';

export function isUseClassStrategy<T>(strategy: ServiceRegisterStrategy<T>): strategy is UseClassServiceRegisterStrategy<T> {
	return strategy.hasOwnProperty(USE_CLASS_PROPERTY_NAME);
}