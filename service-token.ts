import {v4} from 'uuid';
import {ServiceIdentifier} from './decorators/service-identifier';

export type ServiceToken<T = unknown> = string;

export function createServiceToken<T>(slug: string = ''): ServiceIdentifier<T> {
	return `${slug || 'AnonymousService'}@${(v4())}` as ServiceToken<T>;
}