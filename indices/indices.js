// Connect to Substrate endpoint
let global = {
	indices: {},
	limit: 1000,
};

async function connect() {
	let endpoint = document.getElementById('endpoint').value;
	if (!window.substrate || global.endpoint != endpoint) {
		const provider = new api.WsProvider(endpoint);
		document.getElementById('output').innerHTML = 'Connecting to Endpoint...';
		window.substrate = await api.ApiPromise.create({ provider });
		global.endpoint = endpoint;
		document.getElementById('output').innerHTML = 'Connected';
		clearIndices();
	}
}

async function findIndices(a, b) {
	document.getElementById('output').innerHTML = "Querying...";
	let queries = [];
	for (let i = a; i <= b; i++) {
		// Don't look up values we already have
		if (!(i in global.indices)) {
			let query = substrate.query.indices.accounts(i);
			queries.push(i, query);
		}
	}

	let results = await Promise.all(queries);

	for (let i = 0; i < results.length; i += 2) {
		let index = results[i];
		let account = results[i+1];
		let info =[];
		info.push(index);
		let ss58 = substrate.createType('AccountIndex', index).toString();
		info.push(ss58);
		let indexInfo = account.isEmpty ? ["unclaimed", "", ""] : account.value;
		global.indices[index] = info.concat(indexInfo);
	}
}

function createTable() {
	document.getElementById('output').innerHTML = "Creating Table...";

	let keys = ["Index", "SS58", "Owner", "Deposit", "Permanent?"];

	let table = document.getElementById('indices-table');

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

	for (index of Object.keys(global.indices)) {
		let tr2 = document.createElement('tr');
		console.log(index);
		console.log(global.indices[index])

		for (key in keys) {
			console.log(key)
			let td = document.createElement('td');
			td.innerText = global.indices[index][key];
			tr2.appendChild(td);
		}
		tbody.appendChild(tr2);
	}

	thead.appendChild(tr);
	table.appendChild(thead);
	table.appendChild(tbody);

	document.getElementById('output').innerHTML = "Done.";
}

function clearIndices() {
	global.indices = {};
	let table = document.getElementById('indices-table');
	// Clear table
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}
}

// Main function
async function queryIndices() {
	try {
		await connect();

		let start = parseInt(document.getElementById("start").value);
		let end = parseInt(document.getElementById("end").value);

		if (end - start > global.limit) {
			throw `Range is too large! Max range is ${global.limit} in one query.`;
		}

		await findIndices(start, end);
		createTable();

	} catch (error) {
		document.getElementById('output').innerHTML = error;
	}
}
