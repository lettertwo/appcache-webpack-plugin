test:
	@mocha --compilers js:babel/register --reporter min 'test/**/*test*.js'

dev:
	@mocha --compilers js:babel/register --reporter min --watch 'test/**/*test*.js'

lint:
	@eslint ./src ./test

.PHONY: dev test lint
