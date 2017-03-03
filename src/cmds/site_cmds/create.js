'use strict';
const colors = require('colors/safe');
const prompt = require('prompt');
const request = require('request');
const auth = require('../../auth');

const LINC_API_SITES_ENDPOINT = 'https://aduppa8es1.execute-api.us-west-2.amazonaws.com/v0/sites';

const askSiteInfo = () => new Promise((resolve, reject) => {
    let schema = {
        properties: {
            site_name: {
                // Only a-z, 0-9 and - are allowed. Must start with a-z.
                pattern: /^[a-z]+[a-z0-9-]*$/,
                description: colors.green('Name of site to create:'),
                required: true
            },
            description: {
                description: colors.green('Description (optional):'),
                required: false    
            }
        }
    };

    prompt.message = colors.magenta('(linc) ');
    prompt.delimiter = '';
    prompt.start();
    prompt.get(schema, (err, result) => {
        if (err) return reject(err);
        else return resolve(result);
    })
});

const createNewSite = (site, authInfo) => new Promise((resolve, reject) => {
    if (site.description.length === 0) site.description = "[No description]";

    const options = {
        method: 'POST',
        url: LINC_API_SITES_ENDPOINT,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authInfo.jwtToken}`
        },
        body: `{ "site_name": "${site.site_name}", "description": "${site.description}" }`
    };

    request(options, (err, response, body) => {
        if (err) return reject(err);

        const json = JSON.parse(body);
        if (json.error) return reject(json.error);

        return resolve(json);
    });
});

const error = (err) => {
    console.log('\nOops! Something went wrong, and your site could not be created. Here\'s what we know:');
    console.log(err);
};

exports.command = 'create';
exports.desc = 'Create an account';
exports.handler = (argv) => {
    let siteName = null;
    askSiteInfo(true)
        .then(name => {
            siteName = name;
            console.log('Please wait...');
        })
        .then(() => auth(argv.accessKey, argv.secretKey))
        .then(auth_params => createNewSite(siteName, auth_params))
        .then(() => console.log('Site successfully created.'))
        .catch(err => error(err));
};