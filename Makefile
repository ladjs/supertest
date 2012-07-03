
test:
	PATH=./node_modules/.bin:${PATH} mocha \
		--require should \
		--reporter spec

.PHONY: test
