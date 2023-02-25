import {ServiceIdentifier} from '../../decorators/service-identifier';

export function isServiceIdentifier<T>(serviceIdentifier: ServiceIdentifier<T>): serviceIdentifier is ServiceIdentifier<T> {
	if (typeof serviceIdentifier === 'string') {
		return true;
	}

	try {
		const handler = {
			construct() {
				return handler;
			},
		};
		return !!(new (new Proxy(serviceIdentifier, handler))());
	} catch (e) {
		return false;
	}
}