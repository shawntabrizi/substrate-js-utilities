// Connect to Substrate endpoint
async function connect(endpoint) {
	const provider = new polkadotApi.WsProvider(endpoint);
	console.log(`Connecting to ${endpoint}`);
	window.substrate = await polkadotApi.ApiPromise.create({ provider });
	console.log(`Connected to ${endpoint}`);
}

let keys = ["specName", "implName", "authoringVersion", "specVersion", "implVersion"];

let tbody = document.createElement('tbody');

// Create a table with the index information
function createTable() {
	document.getElementById('output').innerHTML = "Creating Table...";
	let table = document.getElementById('versions-table');

	// Clear table
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}

	let thead = document.createElement('thead');
	let tr = document.createElement('tr');

	let th = document.createElement('th');
	th.innerText = "network";
	tr.appendChild(th);

	for (key of keys) {
		let th = document.createElement('th');
		th.innerText = key;
		tr.appendChild(th);
	}

	thead.appendChild(tr);
	table.appendChild(thead);
	table.appendChild(tbody);
}

function addRow(network, version) {
	let tr2 = document.createElement('tr');

	let td = document.createElement('td');
	td.innerText = network;
	tr2.appendChild(td);

	for (key of keys) {
		let td = document.createElement('td');
		td.innerText = version[key];
		tr2.appendChild(td);
	}
	tbody.appendChild(tr2);
}

// Main function
async function queryVersions() {
	createTable();

	for (network of networks) {
		try {
			await connect(network);
			let version = await substrate.runtimeVersion.toJSON();
			addRow(network, version);
		} catch (error) {
			console.error(error);
		}
	}
}
