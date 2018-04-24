'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const args = process.argv.slice(2);
const urls = args.filter((arg) => /^(http|https):\/\/.+/.exec(arg));

const system = {};
system['planets'] = [];

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
		.parent().next().text();

	if(rotationVelocity.includes(' ')) {
		rotationVelocity = rotationVelocity.substr(0,rotationVelocity.indexOf(' '));
	}

	if(rotationVelocity.includes('[')) {
		rotationVelocity = rotationVelocity.substr(0,rotationVelocity.indexOf('['));
	}

	if(rotationVelocity.includes('\n')) {
		rotationVelocity = rotationVelocity.substr(0,rotationVelocity.indexOf('\n'));
	}

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




	system.planets.push(planet);

	console.log(system);

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
