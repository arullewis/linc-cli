'use strict';

const build = () => {
    const path = require('path');
    const buildssr = require('@bitgenics/linc-build-ssr');
    const packageJson = require(path.resolve(process.cwd(), 'package.json'));
    buildssr({}, packageJson, (err, results) => {
    	if (err) console.log(err);

        console.log('Done! The new build can be found in the folder \'dist\'.');
    });
};

exports.command = 'build';
exports.desc = 'Build & package a site for deployment';
exports.handler = (argv) => {
    console.log('Building. Please wait...');
	build();
};
