'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require("fs");

//const args = process.argv.slice(2);
//const urls = args.filter((arg) => /^(http|https):\/\/.+/.exec(arg));

const urlsPlanets = [
	'https://en.wikipedia.org/wiki/Mercury_(planet)',
	'https://en.wikipedia.org/wiki/Venus',
	'https://en.wikipedia.org/wiki/Earth',
	'https://en.wikipedia.org/wiki/Mars',
	'https://en.wikipedia.org/wiki/Jupiter',
	'https://en.wikipedia.org/wiki/Saturn',
	'https://en.wikipedia.org/wiki/Uranus',
	'https://en.wikipedia.org/wiki/Neptune'
];

const urlsStars = [
	'https://en.wikipedia.org/wiki/Sun'
];

const system = {};

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

function scrapePlanets(html) {
	const $ = cheerio.load(html);
	const rootNode = $('table.infobox');
	
	const planet = {};
	
	planet['name'] = rootNode.find('caption.fn.org')
		.contents().first().text().trim();



	// ! radius
	// ========
	let radius = rootNode.find('div:contains("Mean radius")')
		.parent().next().text().trim()
		.match(/\d*\,?\.?\d*\,?\.?\d*\s?±?\s?\d*\.?\d*\skm/)[0];

	if(radius.includes('±')) {
		radius = radius.substr(0,radius.indexOf('±'));
	}

	if(radius.includes('km')) {
		radius = radius.substr(0,radius.indexOf('km'));
	}

	planet['radius'] = radius.trim() + ' km';


	// ! rotation
	// ==========
	let rotationVelocity = rootNode.find('div:contains("Equatorial rotation")')
		.parent().next().text()
		.match(/\d*\,?\.?\d*\.?\d*\skm\/h/)[0];

	planet['rotationVelocity'] = rotationVelocity;


	// ! aphelion
	// ==========
	const aphelion = rootNode.find('a:contains("Aphelion")')
		.parent().next();
		
	planet['aphelion'] = aphelion.text().trim()
		.match(/(\d\.)?(\d{1,3})(,\d{3})*(\u00A0\d{3})*(\.\d+)?\s*AU/)[0]
		.replace(/(\u00A0)|\s|[ ]/g,'');


	// ! perihelion
	// ============
	const perihelion = rootNode.find('a:contains("Perihelion")')
		.parent().next()
		
	planet['perihelion'] = perihelion.text().trim()
		.match(/(\d\.)?(\d{1,3})(,\d{3})*(\u00A0\d{3})*(\.\d+)?\s*AU/)[0]
		.replace(/(\u00A0)|\s|[ ]/g,'');


	// ! velocity
	// ============
	let orbitVelocity = rootNode.find('a[title="Orbital speed"]')
		.parent().parent().next().text();

	planet['orbitVelocity'] = orbitVelocity.match(/\d*\.?\d*\skm\/s/)[0];

	return planet;

}

function scrapeStars(html) {
	const $ = cheerio.load(html);
	const rootNode = $('table.infobox');

	const star = {};

	star['name'] = rootNode.find('caption')
		.contents().first().text().trim();

	star['radius'] = rootNode.find('a[title="Solar radius"]')
		.text().trim() + ' km';

	star['rotationVelocity'] = rootNode.find('th:contains("Rotation velocity")').next().text()
		.match(/\d*\.?\d*\×?\d*\skm\/h/)[0];

	return star;
}

Promise.all(urlsPlanets.map((url) => {
	return fetch(url)
		.then(status)
		.then(text)
		.then(scrapePlanets)
}))
	.then(planets => {
		system['planets'] = planets;
		return fetch(urlsStars[0]);
	})
	.then(status)
	.then(text)
	.then(scrapeStars)
	.then(stars => {
		system['stars'] = [];
		system['stars'].push(stars);
		console.log(system);
		
		fs.writeFile("system.json", JSON.stringify(system), function(err) {
			console.log("File Created");
		});
		
	})
	.catch(e => {
		console.log('There has been a problem with the fetch operation: ', e.message);
	});
