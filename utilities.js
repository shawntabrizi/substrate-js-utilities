/* Balance to Hex (Little Endian) */
let b2h = {
	"balance": document.getElementById("balance-b2h"),
	"hex": document.getElementById("hex-b2h")
};

b2h.balance.addEventListener("input", bn2hex);
b2h.hex.addEventListener("input", hex2bn);

function bn2hex() {
	try {
		b2h.hex.value = util.bnToHex(b2h.balance.value, { isLe: true });
	} catch (e) {
		b2h.hex.value = "Error";
		console.error(e);
	}
}

function hex2bn() {
	try {
		b2h.balance.value = util.hexToBn(b2h.hex.value, { isLe: true });
	} catch (e) {
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
	} catch (e) {
		a2h.hex.value = "Error";
		console.error(e);
	}
}

function hex2account() {
	try {
		a2h.account.value = keyring.encodeAddress(a2h.hex.value);
	} catch (e) {
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
	} catch (e) {
		blake2.hash.innerText = "Error";
		console.error(e);
	}
}

/* Blake-256 Concat a String */
let blake2concat = {
	"input": document.getElementById("input-blake2-concat"),
	"bits": document.getElementById("bits-blake2-concat"),
	"hash": document.getElementById("hash-blake2-concat")
};

blake2concat.input.addEventListener("input", blake2ConcatString);
blake2concat.bits.addEventListener("input", blake2ConcatString);

function blake2ConcatString() {
	try {
		let hash = util_crypto.blake2AsHex(blake2concat.input.value, blake2concat.bits.value);
		if (util.isHex(blake2concat.input.value)) {
			hash += blake2concat.input.value.substr(2);
		} else {
			hash += util.stringToHex(blake2concat.input.value).substr(2);
		}
		blake2concat.hash.innerText = hash;
	} catch (e) {
		blake2concat.hash.innerText = "Error";
		console.error(e);
	}
}

/* XXHash a String */
let xxhash = {
	"input": document.getElementById("input-xxhash"),
	"bits": document.getElementById("bits-xxhash"),
	"hash": document.getElementById("hash-xxhash")
};

xxhash.input.addEventListener("input", xxhashString);
xxhash.bits.addEventListener("input", xxhashString);

function xxhashString() {
	try {
		xxhash.hash.innerText = util_crypto.xxhashAsHex(xxhash.input.value, xxhash.bits.value);
	} catch (e) {
		xxhash.hash.innerText = "Error";
		console.error(e);
	}
}

/* XXHash Concat a String */
let xxhashconcat = {
	"input": document.getElementById("input-xxhash-concat"),
	"bits": document.getElementById("bits-xxhash-concat"),
	"hash": document.getElementById("hash-xxhash-concat")
};

xxhashconcat.input.addEventListener("input", xxhashConcatString);
xxhashconcat.bits.addEventListener("input", xxhashConcatString);

function xxhashConcatString() {
	try {
		let hash = util_crypto.xxhashAsHex(xxhashconcat.input.value, xxhashconcat.bits.value);
		if (util.isHex(xxhashconcat.input.value)) {
			hash += xxhashconcat.input.value.substr(2);
		} else {
			hash += util.stringToHex(xxhashconcat.input.value).substr(2);
		}
		xxhashconcat.hash.innerText = hash;
	} catch (e) {
		xxhashconcat.hash.innerText = "Error";
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
	} catch (e) {
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
		let decoded = util_crypto.decodeAddress(address);
		let prefix = cap.prefix.value;
		if (prefix) {
			cap.result.innerText = util_crypto.encodeAddress(decoded, prefix);
		} else {
			cap.result.innerText = util_crypto.encodeAddress(decoded);
		}
	} catch (e) {
		cap.result.innerText = "Error";
		console.error(e);
	}
}

/* Public key to ss58 */
let pts = {
	"address": document.getElementById("address-pts"),
	"prefix": document.getElementById("prefix-pts"),
	"result": document.getElementById("result-pts")
};

pts.prefix.addEventListener("input", changeAddressPrefix);
pts.address.addEventListener("input", changeAddressPrefix);

function changeAddressPrefix() {
	try {
		let address = pts.address.value;
		let prefix = pts.prefix.value;
		if (prefix) {
			pts.result.innerText = util_crypto.encodeAddress(address, prefix);
		} else {
			pts.result.innerText = util_crypto.encodeAddress(address);
		}
	} catch (e) {
		pts.result.innerText = "Error";
		console.error(e);
	}
}

/* Module ID to Address */
let modid = {
	"moduleId": document.getElementById("moduleId-modid"),
	"address": document.getElementById("address-modid")
};

modid.moduleId.addEventListener("input", moduleId2Address);
modid.address.addEventListener("input", moduleId2Address);

function moduleId2Address() {
	try {
		let moduleId = modid.moduleId.value;
		if (moduleId.length != 8) {
			modid.address.innerText = "Module Id must be 8 characters (i.e. `py/trsry`)";
			return
		}
		let address = util.stringToU8a(("modl" + moduleId).padEnd(32, '\0'));
		modid.address.innerText = util_crypto.encodeAddress(address);
	} catch (e) {
		modid.address.innerText = "Error";
		console.error(e);
	}
}

/* Sub Account Generator */
let subid = {
	"address": document.getElementById("address-subid"),
	"index": document.getElementById("index-subid"),
	"subid": document.getElementById("subid-subid")
};

subid.address.addEventListener("input", subAccountId);
subid.index.addEventListener("input", subAccountId);

function subAccountId() {
	try {
		let address = subid.address.value;
		let index = subid.index.value;

		let seedBytes = util.stringToU8a("modlpy/utilisuba");
		let whoBytes = util_crypto.decodeAddress(address);
		if (isNaN(parseInt(index))) {
			subid.subid.innerText = "Bad Index";
			return;
		}
		let indexBytes = util.bnToU8a(parseInt(index), 16);
		let combinedBytes = new Uint8Array(seedBytes.length + whoBytes.length + indexBytes.length);
		combinedBytes.set(seedBytes);
		combinedBytes.set(whoBytes, seedBytes.length);
		combinedBytes.set(indexBytes, seedBytes.length + whoBytes.length);

		let entropy = util_crypto.blake2AsU8a(combinedBytes, 256);
		subid.subid.innerText = util_crypto.encodeAddress(entropy);
	} catch (e) {
		subid.subid.innerText = "Error";
		console.error(e);
	}
}
