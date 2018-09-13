ALL: pub/index.js

serve:
	php -S 0.0.0.0:8080 -t pub

pub/index.js: index.ts
	tsc --lib es6,DOM --outFile $@ $<