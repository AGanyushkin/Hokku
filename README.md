
# Development

### Install dependencies

Install all dependencies from npm repository

    # npm install

### Build

    # npm run build
    
or for components

    # npm run core:build
    # npm run node:build
    # npm run web:build

### Tests
#### pre requirements

How to prepare environment to execute all available tests 

    # npm run mock:init
    
Also you can deinitialize environment as described below

    # npm run mock:deinit

to start mock components

    # npm run mock:start
    
to stop mock components
    
    # npm run mock:stop
    
After you have mock components in active state you can start tests

#### run tests

    # npm run core:test:node
    # npm run core:test:browser
    # npm run core:test:watch
    # npm run core:test
    
    # npm run core:integration:node
    # npm run core:integration:browser
    # npm run core:integration
    
    # npm run node:test
    # npm run node:test:watch
    # npm run node:integration
    
    
    # npm run web:test
    # npm run web:test:watch
    # npm run web:integration

to run all tests please use

    # npm run test
    # npm run integration
