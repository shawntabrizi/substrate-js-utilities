/* Balance to Hex (Little Endian) */
let b2h = {
	"balance": document.getElementById("balance-b2h"),
	"hex": document.getElementById("hex-b2h")
};

b2h.balance.addEventListener("input", bn2hex);
b2h.hex.addEventListener("input", hex2bn);

function bn2hex() {
	try {
		b2h.hex.value = util.bnToHex(b2h.balance.value, { isLe: true});
	} catch(e) {
		b2h.hex.value = "Error";
		console.error(e);
	}
}

function hex2bn() {
	try {
		b2h.balance.value = util.hexToBn(b2h.hex.value, { isLe: true});
	} catch(e) {
		b2h.balance.value = "Error";
		console.error(e);
	}
}

/* AccountId to Hex */
let a2h = {
	"account": document.getElementById("account-a2h"),
	"hex": document.getElementById("hex-a2h")
};

a2h.account.addEventListener("input", account2hex);
a2h.hex.addEventListener("input", hex2account);

function account2hex() {
	try {
		a2h.hex.value = util.u8aToHex(keyring.decodeAddress(a2h.account.value));
	} catch(e) {
		a2h.hex.value = "Error";
		console.error(e);
	}
}

function hex2account() {
	try {
		a2h.account.value = keyring.encodeAddress(a2h.hex.value);
	} catch(e) {
		a2h.account.value = "Error";
		console.error(e);
	}
}

/* Blake-256 a String */
let blake2 = {
	"input": document.getElementById("input-blake2"),
	"bits": document.getElementById("bits-blake2"),
	"hash": document.getElementById("hash-blake2")
};

blake2.input.addEventListener("input", blake2string);
blake2.bits.addEventListener("input", blake2string);

function blake2string() {
	try {
		blake2.hash.innerText = util_crypto.blake2AsHex(blake2.input.value, blake2.bits.value);
	} catch(e) {
		blake2.hash.innerText = "Error";
		console.error(e);
	}
}

/* XXHash a String */
let xxhash = {
	"input": document.getElementById("input-xxhash"),
	"bits": document.getElementById("bits-xxhash"),
	"hash": document.getElementById("hash-xxhash")
};

xxhash.input.addEventListener("input", xxhash2string);
xxhash.bits.addEventListener("input", xxhash2string);

function xxhash2string() {
	try {
		xxhash.hash.innerText = util_crypto.xxhashAsHex(xxhash.input.value, xxhash.bits.value);
	} catch(e) {
		xxhash.hash.innerText = "Error";
		console.error(e);
	}
}

/* Seed to Address */
let s2a = {
	"address": document.getElementById("address-s2a"),
	"seed": document.getElementById("seed-s2a")
};

s2a.seed.addEventListener("input", seed2address);

function seed2address() {
	try {
		let k = new keyring.Keyring({ type: "sr25519" });
		let user = k.addFromUri(s2a.seed.value);
		s2a.address.innerText = user.address;
	} catch(e) {
		s2a.address.innerText = "Error";
		console.error(e);
	}
}

/* Change Address Prefix */
let cap = {
	"address": document.getElementById("address-cap"),
	"prefix": document.getElementById("prefix-cap"),
	"result": document.getElementById("result-cap")
};

cap.prefix.addEventListener("input", changeAddressPrefix);
cap.address.addEventListener("input", changeAddressPrefix);

function changeAddressPrefix() {
	try {
		let address = cap.address.value;
		console.log(address)
		let decoded = util_crypto.decodeAddress(address);
		console.log(decoded)
		let prefix = cap.prefix.value;
		if (prefix) {
			cap.result.innerText = util_crypto.encodeAddress(decoded, prefix);
		} else {
			cap.result.innerText = util_crypto.encodeAddress(decoded);
		}
	} catch(e) {
		cap.result.innerText = "Error";
		console.error(e);
	}
}