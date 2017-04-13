'use strict';
const colors = require('colors/safe');
const prompt = require('prompt');
const request = require('request');
const auth = require('../../auth');
const config = require('../../config.json');

const LINC_API_SITES_ENDPOINT = config.Api.LincBaseEndpoint + '/sites';

const getAvailableDomains = (site_name, authInfo) => new Promise((resolve, reject) => {
    const options = {
        method: 'GET',
        url: `${LINC_API_SITES_ENDPOINT}/${site_name}/domains`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authInfo.jwtToken}`
        }
    };
    request(options, (err, response, body) => {
        if (err) return reject(err);
        if (response.statusCode !== 200) return reject(`Error ${response.statusCode}: ${response.statusMessage}`);

        const json = JSON.parse(body);
        if (json.error) return reject(json.error);
        if (!json.domains || json.domains.length === 0) return reject('No domains available.\nAdd a domain first using \'linc domain add\'.');

        return resolve(json);
    });
});

const showAvailableDomains = (results) => {
    const domains = results.domains;
    const site_name = results.site_name;

    console.log(`Here are the most recent domains for ${site_name}:`);
    domains.forEach(d => {
        console.log(`  +- ${d.domain_name}`);
        console.log(`        +- Created at ${d.created_at}`);
    });
    console.log('');
};

const list = (argv) => {
    if (argv.siteName === undefined) {
        console.log('This project is not initialised. Did you forget to \'linc init\'?');
        process.exit(255);
    }

    auth(argv.accessKey, argv.secretKey)
        .then(auth_params => getAvailableDomains(argv.siteName, auth_params))
        .then(result => showAvailableDomains(result))
        .catch(err => console.log(`Oops, something went wrong:\n${err}.`));

    console.log('Please wait...');
};

exports.command = 'list';
exports.desc = 'List available domain names';
exports.handler = (argv) => {
    list(argv);
};
