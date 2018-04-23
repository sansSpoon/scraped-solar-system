'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const args = process.argv.slice(2);
const urls = args.filter((arg) => /^(http|https):\/\/.+/.exec(arg));

function json(response) {
	return response.json()
}

function text(response) {
	return response.text()
}

function status(response) {
	if (response.ok) {
		return Promise.resolve(response);
	} else {
		return Promise.reject(new Error(response.statusText));
	}
}

function scrape(html) {
	const $ = cheerio.load(html);

	const rootNode = $('.firstHeading').text();
	console.log(rootNode);

}

Promise.all(urls.map((url) => {
	fetch(url)
		.then(status)
		.then(text)
		.then(scrape)
		.catch(e => {
			console.log('There has been a problem with the fetch operation: ', e.message);
		})
}));
