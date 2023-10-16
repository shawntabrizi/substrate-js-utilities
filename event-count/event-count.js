const { BN } = polkadotUtil;
const { WsProvider, ApiPromise } = polkadotApi;

// Global Variables
var global = {
	all_events: [],
	blockHashes: [],
	endpoint: '',
	total_events: 0,
};


// Given an address and a range of blocks, query the Substrate blockchain for the events across the range
async function getEventsInRange(startBlock, endBlock) {
	// Tell the user the data is loading...
	document.getElementById('output').innerHTML =
		`Getting events for blocks ${startBlock} to ${endBlock}...`;

	let step = 1;

	try {
		var promises = [];

		// Get all block hashes
		for (let i = startBlock; i < endBlock; i = i + step) {
			if (!global.blockHashes.find(x => x.block == i)) {
				let blockHashPromise = substrate.rpc.chain.getBlockHash(i);
				promises.push(i, blockHashPromise);
			}
		}

		var results = await Promise.all(promises);

		for (let i = 0; i < results.length; i = i + 2) {
			global.blockHashes.push({
				block: results[i],
				hash: results[i + 1]
			});
		}

		var promises = [];

		// Loop over the blocks, using the step value
		for (let i = startBlock; i < endBlock; i = i + step) {
			// If we already have data about that block, skip it
			if (!global.all_events.find(x => x.block == i)) {
				// Get the block hash
				let blockHash = global.blockHashes.find(x => x.block == i).hash;
				// Create a promise to query the events for that block
				let eventPromise = substrate.query.system.events.at(blockHash);
				// Create a promise to get the timestamp for that block
				let timePromise = substrate.query.timestamp.now.at(blockHash);
				// Push data to a linear array of promises to run in parallel.
				promises.push(i, eventPromise, timePromise);
			}
		}

		// Call all promises in parallel for speed.
		var results = await Promise.all(promises);

		// Restructure the data into an array of objects
		var all_events = [];
		for (let i = 0; i < results.length; i = i + 3) {
			let block = results[i];
			let events = results[i + 1];

			let eventCount = events.length;

			all_events.push({
				block: block,
				eventCount: eventCount,
				time: new Date(results[i + 2].toNumber())
			});
		}

		//Remove loading message
		document.getElementById('output').innerHTML = '';

		return all_events;
	} catch (error) {
		document.getElementById('output').innerHTML = error;
	}
}

// Connect to Substrate endpoint
async function connect() {
	let endpoint = document.getElementById('endpoint').value;
	if (!window.substrate || global.endpoint != endpoint) {
		const provider = new WsProvider(endpoint);
		document.getElementById('output').innerHTML = 'Connecting to Endpoint...';
		window.substrate = await ApiPromise.create({ provider });
		global.endpoint = endpoint;
		global.chainDecimals = substrate.registry.chainDecimals[0];
		global.chainToken = substrate.registry.chainTokens[0];
		document.getElementById('output').innerHTML = 'Connected';
	}
}

// Create a table with the event information
function createTable() {
	document.getElementById('output').innerHTML = "Creating Table...";

	let keys = ["block", "eventCount", "time"];

	let table = document.getElementById('events-table');

	let count_container = document.createElement('p');
	count_container.innerText = `Total Count: ${total_count()}`;

	// Clear table
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}

	let thead = document.createElement('thead');
	let tbody = document.createElement('tbody');

	let tr = document.createElement('tr');
	for (key of keys) {
		let th = document.createElement('th');
		th.innerText = key;
		tr.appendChild(th);
	}

	for (index of Object.keys(global.all_events)) {
		let tr2 = document.createElement('tr');

		for (key of keys) {
			let td = document.createElement('td');
			td.innerText = global.all_events[index][key];
			tr2.appendChild(td);
		}
		tbody.appendChild(tr2);
	}

	thead.appendChild(tr);
	table.appendChild(count_container);
	table.appendChild(thead);
	table.appendChild(tbody);

	document.getElementById('output').innerHTML = "Done.";
}

function total_count() {
	let total_events = global.all_events.reduce((partialSum, a) => partialSum + a.eventCount, 0);
	return total_events
}

async function countEvents() {
	await connect();

	// Find the intial range, from first block to current block
	var startBlock, endBlock;

	if (document.getElementById('endBlock').value) {
		endBlock = parseInt(document.getElementById('endBlock').value);
	} else {
		endBlock = parseInt(await substrate.derive.chain.bestNumber());
	}

	if (document.getElementById('startBlock').value) {
		startBlock = parseInt(document.getElementById('startBlock').value);
	} else {
		// 10 blocks per minute, 1440 min per day, 7 days per week
		let HISTORICAL = 10 * 1440 * 7;
		startBlock = endBlock < HISTORICAL ? 0 : endBlock - HISTORICAL;
	}

	// query chain 100 blocks at a time
	let step = 100;
	for (let i = startBlock; i < endBlock; i = i + step) {
		newEvents = await getEventsInRange(i, i + step);
		global.all_events = global.all_events.concat(newEvents);
		createTable();
	}
}
