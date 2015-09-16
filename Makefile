test:
	@mocha --compilers js:babel/register --reporter min 'test/**/*test*.js'

dev:
	@mocha --compilers js:babel/register --reporter min --watch 'test/**/*test*.js'

lint:
	@eslint ./src ./test

changelog.template.ejs:
	@echo "## x.x.x\n\n<% commits.forEach(function(commit) { -%>\n* <%= commit.title %>\n<% }) -%>" > changelog.template.ejs

changelog: changelog.template.ejs
	@git-release-notes $$(git describe --abbrev=0)..HEAD $< | cat - CHANGELOG.md >> CHANGELOG.md.new
	@mv CHANGELOG.md{.new,}
	@rm changelog.template.ejs
	@echo "Added changes since $$(git describe --abbrev=0) to CHANGELOG.md"

build:
	@babel --stage=0 src --out-dir lib

.PHONY: dev test lint build
