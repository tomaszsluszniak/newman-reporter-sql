PROJECT = "newman-reporter-sql"

.PHONY: local-install 

local-install:
	npm uninstall -g ${PROJECT}
	npm pack
	npm install -g ${PROJECT}-*.tgz

bump:
	npm version patch -m "Bumped to version %s"

publish:
	npm publish
