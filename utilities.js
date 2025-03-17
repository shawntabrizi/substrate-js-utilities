const { stringToHex, isHex, bnToHex, hexToBn, hexToU8a, hexToString, u8aToHex, stringToU8a, bnToU8a } = polkadotUtil;
const { blake2AsHex, keccak256AsU8a, xxhashAsHex, encodeAddress, decodeAddress, blake2AsU8a } = polkadotUtilCrypto;
const { Keyring } = polkadotKeyring;
/* String to Hex */
let s2h = {
	"string": document.getElementById("string-s2h"),
	"hex": document.getElementById("hex-s2h")
};

s2h.string.addEventListener("input", string2hex);
s2h.hex.addEventListener("input", hex2string);

function string2hex() {
	try {
		s2h.hex.value = stringToHex(s2h.string.value);
	} catch (e) {
		s2h.hex.value = "Error";
		console.error(e);
	}
}

function hex2string() {
	try {
		s2h.string.value = hexToString(s2h.hex.value);
	} catch (e) {
		s2h.string.value = "Error";
		console.error(e);
	}
}

/* Balance to Hex (Little Endian) */
let b2h = {
	"balance": document.getElementById("balance-b2h"),
	"hex": document.getElementById("hex-b2h")
};

b2h.balance.addEventListener("input", bn2hex);
b2h.hex.addEventListener("input", hex2bn);

function bn2hex() {
	try {
		b2h.hex.value = bnToHex(b2h.balance.value, { isLe: true });
	} catch (e) {
		b2h.hex.value = "Error";
		console.error(e);
	}
}

function hex2bn() {
	try {
		b2h.balance.value = hexToBn(b2h.hex.value, { isLe: true });
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
		a2h.hex.value = u8aToHex(decodeAddress(a2h.account.value));
	} catch (e) {
		a2h.hex.value = "Error";
		console.error(e);
	}
}

function hex2account() {
	try {
		a2h.account.value = encodeAddress(a2h.hex.value);
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
		blake2.hash.innerText = blake2AsHex(blake2.input.value, blake2.bits.value);
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
		let hash = blake2AsHex(blake2concat.input.value, blake2concat.bits.value);
		if (isHex(blake2concat.input.value)) {
			hash += blake2concat.input.value.substr(2);
		} else {
			hash += stringToHex(blake2concat.input.value).substr(2);
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
		xxhash.hash.innerText = xxhashAsHex(xxhash.input.value, xxhash.bits.value);
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
		let hash = xxhashAsHex(xxhashconcat.input.value, xxhashconcat.bits.value);
		if (isHex(xxhashconcat.input.value)) {
			hash += xxhashconcat.input.value.substr(2);
		} else {
			hash += stringToHex(xxhashconcat.input.value).substr(2);
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
		let k = new Keyring({ type: "sr25519" });
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
		let decoded = decodeAddress(address);
		let prefix = cap.prefix.value;
		if (prefix) {
			cap.result.innerText = encodeAddress(decoded, prefix);
		} else {
			cap.result.innerText = encodeAddress(decoded);
		}
	} catch (e) {
		cap.result.innerText = "Error";
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
		let address = stringToU8a(("modl" + moduleId).padEnd(32, '\0'));
		modid.address.innerText = encodeAddress(address);
	} catch (e) {
		modid.address.innerText = "Error";
		console.error(e);
	}
}

/* Para ID to Address */
let paraid = {
	"paraId": document.getElementById("paraId-paraid"),
	"address": document.getElementById("address-paraid")
};
let paraType = document.getElementById("type-paraid");

paraid.paraId.addEventListener("input", paraId2Address);
paraid.address.addEventListener("input", paraId2Address);
paraType.addEventListener("input", paraId2Address);

function paraId2Address() {
	try {
		let paraId = paraid.paraId.value;
		if (!parseInt(paraId)) {
			paraid.address.innerText = "Para Id should be a number";
			return
		}
		let type = paraType.value;
		let typeEncoded = stringToU8a(type);
		let paraIdEncoded = bnToU8a(parseInt(paraId), 16);
		let zeroPadding = new Uint8Array(32 - typeEncoded.length - paraIdEncoded.length).fill(0);
		let address = new Uint8Array([...typeEncoded, ...paraIdEncoded, ...zeroPadding]);
		paraid.address.innerText = encodeAddress(address);
	} catch (e) {
		paraid.address.innerText = "Error";
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

		let seedBytes = stringToU8a("modlpy/utilisuba");
		let whoBytes = decodeAddress(address);
		if (isNaN(parseInt(index))) {
			subid.subid.innerText = "Bad Index";
			return;
		}
		let indexBytes = bnToU8a(parseInt(index), { bitLength: 16 });
		let combinedBytes = new Uint8Array(seedBytes.length + whoBytes.length + indexBytes.length);
		combinedBytes.set(seedBytes);
		combinedBytes.set(whoBytes, seedBytes.length);
		combinedBytes.set(indexBytes, seedBytes.length + whoBytes.length);

		let entropy = blake2AsU8a(combinedBytes, 256);
		subid.subid.innerText = encodeAddress(entropy);
	} catch (e) {
		subid.subid.innerText = "Error";
		console.error(e);
	}
}

/* Ethereum to Substrate Address */
let e2s = {
	"eth": document.getElementById("eth-e2s"),
	"sub": document.getElementById("sub-e2s"),
};

e2s.eth.addEventListener("input", eth2Sub);
e2s.sub.addEventListener("input", sub2Eth);

function eth2Sub() {
	try {
		let ethAddress = e2s.eth.value;

		// Ensure the address is a valid Ethereum address (20 bytes)
		if (!ethAddress.startsWith('0x') || ethAddress.length !== 42) {
			e2s.sub.value = "Invalid Ethereum address";
			return;
		}

		// Convert Ethereum address to bytes and append the `e`
		const ethBytes = hexToU8a(ethAddress);
		// Create Substrate address with all `0xee`.
		const substrateBytes = new Uint8Array(32).fill(0xee);
		// Copy the Ethereum bytes into the first 20 bytes
		substrateBytes.set(ethBytes, 0);

		// Convert to a Substrate address.
		const ss58Address = encodeAddress(substrateBytes, 42);

		e2s.sub.value = ss58Address;
	} catch (e) {
		e2s.sub.value = "Error";
		console.error(e);
	}
}

// See https://github.com/paritytech/polkadot-sdk/blob/c4b8ec123afcef596fbc4ea3239ff9e392bcaf36/substrate/frame/revive/src/address.rs?plain=1#L101-L113
function sub2Eth() {
	try {
		let substrateAddress = e2s.sub.value;

		// Decode the Substrate address into raw bytes.
		const substrateBytes = decodeAddress(substrateAddress);

		// if last 12 bytes are all `0xEE`, 
		// we just strip the 0xEE suffix to get the original address
		if (substrateBytes.slice(20).every(b => b === 0xEE)) {
			e2s.eth.value = u8aToHex(substrateBytes.slice(0, 20));
			return;
		}

		// this is an (ed|sr)25510 derived address
		// We Hash it with keccak_256 and take the last 20 bytes
		const ethBytes = keccak256AsU8a(substrateBytes).slice(-20);

		// Convert to Ethereum address.
		const ethAddress = u8aToHex(ethBytes);

		e2s.eth.value = ethAddress;
	} catch (e) {
		e2s.eth.value = "Error";
		console.error(e);
	}
}

/* u8a to Hex */
let u82h = {
	"u8a": document.getElementById("u8a-u82h"),
	"hex": document.getElementById("hex-u82h")
};

u82h.u8a.addEventListener("input", u8a2hex);
u82h.hex.addEventListener("input", hex2u8a);

function u8a2hex() {
	try {
		let array = u82h.u8a.value.replace(/ /g, "").split(",").filter(e => e);
		let u8array = new Uint8Array(array);
		u82h.hex.value = u8aToHex(u8array);
	} catch (e) {
		u82h.hex.value = "Error";
		console.error(e);
	}
}

function hex2u8a() {
	try {
		let array = u82h.hex.value.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
		let u8a = new Uint8Array(array);
		u82h.u8a.value = u8a;
	} catch (e) {
		u82h.hex.value = "Error";
		console.error(e);
	}
}
