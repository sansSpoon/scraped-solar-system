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
	const radius = rootNode.find('div:contains("Mean radius")')
		.parent().next().find('li:first-child > span > span')
	
	if(radius.length > 0) {
		planet['radius'] = radius.contents()
			.filter(function() {
				return this.nodeType == 3;
			}).first().text() + ' km';
	} else {
		const radiusText = rootNode.find('div:contains("Mean radius")')
		.parent().next().text();
		if(radiusText.includes('±')) {
			planet['radius'] = radiusText.substr(0,radiusText.indexOf('±')).trim() + ' km';
		} else {
			planet['radius'] = radiusText.substr(0,radiusText.indexOf(' ')).trim();
		}
	}


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
		.parent().next().find('li:nth-child(2)');
		
	if(aphelion.length > 0) {
		if(aphelion.children().length > 0) {
			const aphelionText = aphelion.text();
			planet['aphelion'] = aphelionText.substr(aphelionText.indexOf('♠')+1);
		} else {
			planet['aphelion'] = aphelion.text();
		}
	} else {
		const aphelionText = rootNode.find('a:contains("Aphelion")')
		.parent().next().text();
		
		planet['aphelion'] = aphelionText.substr(0,aphelionText.indexOf('\n'));
		
	}


	// ! perihelion
	// ============
	const perihelion = rootNode.find('a:contains("Perihelion")')
		.parent().next().find('li:nth-child(2)');

	if(perihelion.length > 0) {
		if(perihelion.children().length > 0) {
			const perihelionText = perihelion.text();
			planet['perihelion'] = perihelionText.substr(perihelionText.indexOf('♠')+1);
		} else {
			planet['perihelion'] = perihelion.text();
		}
	} else {
		const perihelionText = rootNode.find('a:contains("Perihelion")')
		.parent().next().text();
		
		planet['perihelion'] = perihelionText.substr(0,perihelionText.indexOf('\n'));
	}


	// ! velocity
	// ============
	planet['orbitVelocity'] = rootNode.find('a[title="Orbital speed"]')
		.parent().parent().next().contents().first().text();
		
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
