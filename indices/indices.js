// Connect to Substrate endpoint
let global = {
	indices: {},
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
	for (let i = a; i < b; i++) {
		// Don't look up values we already have
		if (!(i in global.indices)) {
			let account = await substrate.query.indices.accounts(i);
			let values = [i];
			let ss58 = substrate.createType('AccountIndex', i).toString();
			values.push(ss58);
			global.indices[i] = values.concat(account.value);
		}
	}
}

function createTable() {
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

		await findIndices(start, end);
		createTable();

	} catch (error) {
		document.getElementById('output').innerHTML = error;
	}
}
