publish:
				npm publish --dry-run

lint:
				npx eslint

install:
				npm ci

develop:
				npx webpack serve

build:
				NODE_ENV=production npx webpack
	