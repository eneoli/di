import {Constructor} from '../types/constructor';
import {ServiceToken} from '../service-token';

export type ServiceIdentifier<T> = ServiceToken<T> | Constructor<any[], T>;