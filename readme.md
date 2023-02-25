# di - A lightweight Typescript Dependency Injector

## What this library does

di allows you to autowire classes into other clases by declaring them as services.

Take this example:

di.ts
```typescript
import 'reflect-metadata'

export const { di, Service, inject, injectAll } = createServiceLocator();
```

network-service.ts
```typescript
import {Service} from './di';

@Service()
export class NetworkService() {
    public connect() {}
}
```

user-service.ts
```typescript
import {Service} from './di';

@Service()
export class UserService() {
    public UserService(private networkService: NetworkService) {
    }
    
    private doStuff() {
        this.networkService.connect();
    }
}
```

index.ts
```typescript
const userService = di.get(UserService); // resolves all dependencies

userService.doStuff();
```

Other features include tagging services and injecting all services tagged with a specific tag. Also custom service injections can be propsed.