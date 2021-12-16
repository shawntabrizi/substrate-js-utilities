// Some global variables used by this code.
let global = {
	endpoint: "",
	account: {},
	validators: [],
};

function output(text) {
	document.getElementById('output').innerHTML = text;
}

// Connect to Substrate endpoint
async function connect() {
	let endpoint = document.getElementById('endpoint').value;
	if (!window.substrate || global.endpoint != endpoint) {
		const provider = new api.WsProvider(endpoint);
		output('Connecting to Endpoint...');
		window.substrate = await api.ApiPromise.create({ provider });
		global.endpoint = endpoint;
		output('Connected');
	}
}

async function getNominations(address) {
	output("Querying...");
	if (!substrate.derive.staking) {
		output("Could not find derive.staking api.");
		return;
	}

	global.account = await substrate.derive.staking.account(address);
	if (global.account.nominators.length == 0) {
		output(`No nominations found for ${address}.`);
		return;
	}
	global.validators = await substrate.derive.staking.accounts(global.account.nominators);
	// pull out commission and get identity
	for ([index, validator] of global.validators.entries()) {
		validator["identity"] = await substrate.derive.accounts.identity(validator.accountId);
		validator["commission"] = validator.validatorPrefs.commission.toHuman();
		validator["display"] = validator.identity.displayParent ? validator.identity.displayParent + "/" : "";
		validator["display"] += validator.identity.display;
		validator["#"] = index;
		validator["lastClaimed"] = validator.stakingLedger.claimedRewards.slice(-1)[0];
		validator["selfStake"] = substrate.createType("Balance", validator.stakingLedger.active).toHuman();
	}
	return global.validators;
}

// Create a table with the information
function createTable(validators) {
	output("Creating Table...");

	//let keys = Object.keys(validators[0]);

	let keys = ["#", "display", "accountId", "commission", "lastClaimed", "selfStake"];
	let table = document.getElementById('validators-table');

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

	for (account of validators) {
		let tr2 = document.createElement('tr');

		for (key of keys) {
			let td = document.createElement('td');
			td.innerText = account[key];
			tr2.appendChild(td);
		}
		tbody.appendChild(tr2);
	}

	thead.appendChild(tr);
	table.appendChild(thead);
	table.appendChild(tbody);

	output("Done.");
}

// Main function
async function queryNominations() {
	try {
		await connect();

		let address = document.getElementById("address").value;

		let validators = await getNominations(address);
		createTable(validators);

	} catch (error) {
		output(error);
	}
}
