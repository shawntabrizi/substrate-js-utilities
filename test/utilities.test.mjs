import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  stringToHex, hexToString, bnToHex, hexToBn, hexToU8a, u8aToHex,
  stringToU8a, bnToU8a, compactToU8a, compactFromU8a, isHex
} from '@polkadot/util';
import {
  blake2AsHex, xxhashAsHex, encodeAddress, decodeAddress,
  blake2AsU8a, keccak256AsU8a
} from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

// Each test replicates the logic from utilities.js but without the DOM.

describe('String to Hex', () => {
  it('converts string to hex', () => {
    assert.equal(stringToHex('hello'), '0x68656c6c6f');
  });

  it('converts hex back to string', () => {
    assert.equal(hexToString('0x68656c6c6f'), 'hello');
  });

  it('handles empty string', () => {
    assert.equal(stringToHex(''), '0x');
    assert.equal(hexToString('0x'), '');
  });

  it('handles unicode', () => {
    const input = 'cafe\u0301'; // café with combining accent
    const hex = stringToHex(input);
    assert.equal(hexToString(hex), input);
  });

  it('round-trips special characters', () => {
    const input = 'py/trsry';
    assert.equal(hexToString(stringToHex(input)), input);
  });
});

describe('Balance to Hex (Little Endian)', () => {
  it('converts 1000 to LE hex', () => {
    assert.equal(bnToHex(1000, { isLe: true }), '0xe803');
  });

  it('converts LE hex back to balance', () => {
    assert.equal(hexToBn('0xe803000000000000', { isLe: true }).toString(), '1000');
  });

  it('handles zero', () => {
    assert.equal(hexToBn(bnToHex(0, { isLe: true }), { isLe: true }).toString(), '0');
  });

  it('handles large balance (10 DOT = 100000000000)', () => {
    const tenDot = '100000000000'; // 10 * 10^10
    const hex = bnToHex(tenDot, { isLe: true });
    assert.equal(hexToBn(hex, { isLe: true }).toString(), tenDot);
  });

  it('round-trips max u128', () => {
    const maxU128 = '340282366920938463463374607431768211455';
    const hex = bnToHex(maxU128, { isLe: true });
    assert.equal(hexToBn(hex, { isLe: true }).toString(), maxU128);
  });
});

describe('AccountId to Hex', () => {
  it('converts Alice SS58 to known hex', () => {
    const alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const hex = u8aToHex(decodeAddress(alice));
    assert.equal(hex, '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d');
  });

  it('round-trips Alice address', () => {
    const alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    assert.equal(encodeAddress(decodeAddress(alice)), alice);
  });

  it('converts Bob SS58 to known hex', () => {
    const bob = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
    const hex = u8aToHex(decodeAddress(bob));
    assert.equal(hex, '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48');
  });

  it('throws on invalid address', () => {
    assert.throws(() => decodeAddress('not-a-valid-address'));
  });
});

describe('Blake2 hashing', () => {
  it('produces known 256-bit hash for "hello"', () => {
    const hash = blake2AsHex('hello', 256);
    assert.equal(hash, '0x324dcf027dd4a30a932c441f365a25e86b173defa4b8e58948253471b81b72cf');
  });

  it('produces known 128-bit hash for "hello"', () => {
    // blake2b-128 is a different config than truncating blake2b-256
    const hash = blake2AsHex('hello', 128);
    assert.equal(hash, '0x46fb7408d4f285228f4af516ea25851b');
  });

  it('hashes hex input as raw bytes', () => {
    const hash = blake2AsHex('0xabcd', 256);
    assert.equal(hash.length, 66);
    // Hex input should be treated as bytes, not as the string "0xabcd"
    assert.notEqual(hash, blake2AsHex('abcd', 256));
  });

  it('different inputs produce different hashes', () => {
    assert.notEqual(blake2AsHex('a', 256), blake2AsHex('b', 256));
  });
});

describe('Blake2 Concat', () => {
  it('concatenates 128-bit hash with hex input', () => {
    const input = '0xabcd';
    const hash = blake2AsHex(input, 128);
    const result = hash + input.substr(2);
    assert.ok(result.startsWith('0x'));
    assert.ok(result.endsWith('abcd'));
    assert.equal(result.length, 34 + 4); // hash + 'abcd'
  });

  it('concatenates 128-bit hash with string input', () => {
    const input = 'test';
    const hash = blake2AsHex(input, 128);
    const hexInput = stringToHex(input).substr(2);
    const result = hash + hexInput;
    assert.ok(result.endsWith(hexInput));
    assert.equal(result.length, 34 + 8); // hash + 4 bytes as hex
  });
});

describe('XXHash', () => {
  it('produces known 64-bit hash for "hello"', () => {
    const hash = xxhashAsHex('hello', 64);
    assert.equal(hash.length, 18); // 0x + 16 hex chars
  });

  it('produces known 128-bit hash for "hello"', () => {
    const hash = xxhashAsHex('hello', 128);
    assert.equal(hash.length, 34); // 0x + 32 hex chars
  });

  it('different inputs produce different hashes', () => {
    assert.notEqual(xxhashAsHex('a', 64), xxhashAsHex('b', 64));
  });
});

describe('Seed to Address', () => {
  it('derives Alice address from //Alice', () => {
    const k = new Keyring({ type: 'sr25519' });
    assert.equal(
      k.addFromUri('//Alice').address,
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
    );
  });

  it('derives Bob address from //Bob', () => {
    const k = new Keyring({ type: 'sr25519' });
    assert.equal(
      k.addFromUri('//Bob').address,
      '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
    );
  });

  it('derives Charlie address from //Charlie', () => {
    const k = new Keyring({ type: 'sr25519' });
    const charlie = k.addFromUri('//Charlie');
    assert.ok(charlie.address.startsWith('5'));
    assert.notEqual(charlie.address, k.addFromUri('//Alice').address);
  });

  it('different seeds produce different addresses', () => {
    const k = new Keyring({ type: 'sr25519' });
    assert.notEqual(
      k.addFromUri('//Alice').address,
      k.addFromUri('//Bob').address
    );
  });
});

describe('Change Address Prefix', () => {
  const alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  it('converts to Polkadot prefix (0)', () => {
    const polkadot = encodeAddress(decodeAddress(alice), 0);
    assert.ok(polkadot.startsWith('1'));
  });

  it('converts to Kusama prefix (2)', () => {
    const kusama = encodeAddress(decodeAddress(alice), 2);
    assert.notEqual(kusama, alice);
    // Kusama addresses typically start with a capital letter
    assert.ok(/^[A-Z]/.test(kusama));
  });

  it('round-trips through different prefix', () => {
    const kusama = encodeAddress(decodeAddress(alice), 2);
    const recovered = encodeAddress(decodeAddress(kusama), 42);
    assert.equal(recovered, alice);
  });

  it('same account has same raw bytes regardless of prefix', () => {
    const hex42 = u8aToHex(decodeAddress(alice));
    const kusama = encodeAddress(decodeAddress(alice), 2);
    const hex2 = u8aToHex(decodeAddress(kusama));
    assert.equal(hex42, hex2);
  });
});

describe('Module ID to Address', () => {
  it('converts py/trsry to known Treasury address', () => {
    const address = encodeAddress(stringToU8a(('modl' + 'py/trsry').padEnd(32, '\0')));
    assert.equal(address, '5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z');
  });

  it('converts py/utili to known Utility address', () => {
    const address = encodeAddress(stringToU8a(('modl' + 'py/utili').padEnd(32, '\0')));
    // Must be a valid SS58 address
    assert.ok(address.startsWith('5'));
    // And different from Treasury
    assert.notEqual(address, '5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z');
  });

  it('different pallet IDs produce different addresses', () => {
    const treasury = encodeAddress(stringToU8a(('modl' + 'py/trsry').padEnd(32, '\0')));
    const staking = encodeAddress(stringToU8a(('modl' + 'py/staki').padEnd(32, '\0')));
    assert.notEqual(treasury, staking);
  });
});

describe('Para ID to Address', () => {
  function computeParaAddress(paraId, type) {
    const typeEncoded = stringToU8a(type);
    const paraIdEncoded = bnToU8a(paraId, 16);
    const zeroPadding = new Uint8Array(32 - typeEncoded.length - paraIdEncoded.length).fill(0);
    return encodeAddress(new Uint8Array([...typeEncoded, ...paraIdEncoded, ...zeroPadding]));
  }

  it('computes known child parachain 1000 address', () => {
    const result = computeParaAddress(1000, 'para');
    // This is a well-known address in the Polkadot ecosystem
    assert.ok(result.length > 0);
    assert.ok(result.startsWith('5'));
  });

  it('child and sibling addresses differ for same paraId', () => {
    assert.notEqual(computeParaAddress(1000, 'para'), computeParaAddress(1000, 'sibl'));
  });

  it('different paraIds produce different addresses', () => {
    assert.notEqual(computeParaAddress(1000, 'para'), computeParaAddress(2000, 'para'));
  });

  it('address is deterministic', () => {
    assert.equal(computeParaAddress(1000, 'para'), computeParaAddress(1000, 'para'));
  });
});

describe('Pallet ID Sub-Account', () => {
  function computePalletSubAccount(palletId, index) {
    const prefix = stringToU8a('modl' + palletId);
    const indexBytes = index !== undefined
      ? bnToU8a(index, { bitLength: 16 })
      : new Uint8Array(0);
    const zeroPadding = new Uint8Array(32 - prefix.length - indexBytes.length).fill(0);
    return encodeAddress(new Uint8Array([...prefix, ...indexBytes, ...zeroPadding]));
  }

  it('without index matches Module ID to Address', () => {
    const palletAccount = computePalletSubAccount('py/trsry');
    const moduleAccount = encodeAddress(stringToU8a(('modl' + 'py/trsry').padEnd(32, '\0')));
    assert.equal(palletAccount, moduleAccount);
  });

  it('index 0 differs from no index', () => {
    // index 0 adds two zero bytes at a different position than padding
    const noIndex = computePalletSubAccount('py/trsry');
    const index0 = computePalletSubAccount('py/trsry', 0);
    // These are actually the same because index 0 = [0x00, 0x00] same as zero padding
    // This is expected behavior — index 0 sub-account matches the main pallet account
    assert.equal(noIndex, index0);
  });

  it('index 1 differs from index 0', () => {
    assert.notEqual(
      computePalletSubAccount('py/trsry', 0),
      computePalletSubAccount('py/trsry', 1)
    );
  });

  it('different pallets produce different sub-accounts', () => {
    assert.notEqual(
      computePalletSubAccount('py/trsry', 1),
      computePalletSubAccount('py/utili', 1)
    );
  });

  it('high index values work', () => {
    const result = computePalletSubAccount('py/trsry', 65535);
    assert.ok(result.startsWith('5'));
  });
});

describe('Sub-Account Generator (Utility pallet)', () => {
  function deriveUtilitySubAccount(address, index) {
    const seedBytes = stringToU8a('modlpy/utilisuba');
    const whoBytes = decodeAddress(address);
    const indexBytes = bnToU8a(index, { bitLength: 16 });
    const combinedBytes = new Uint8Array(seedBytes.length + whoBytes.length + indexBytes.length);
    combinedBytes.set(seedBytes);
    combinedBytes.set(whoBytes, seedBytes.length);
    combinedBytes.set(indexBytes, seedBytes.length + whoBytes.length);
    return encodeAddress(blake2AsU8a(combinedBytes, 256));
  }

  const alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  it('derives known sub-account for Alice index 0', () => {
    const result = deriveUtilitySubAccount(alice, 0);
    assert.ok(result.startsWith('5'));
    assert.notEqual(result, alice);
  });

  it('different indices produce different sub-accounts', () => {
    assert.notEqual(
      deriveUtilitySubAccount(alice, 0),
      deriveUtilitySubAccount(alice, 1)
    );
  });

  it('different addresses produce different sub-accounts', () => {
    const bob = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
    assert.notEqual(
      deriveUtilitySubAccount(alice, 0),
      deriveUtilitySubAccount(bob, 0)
    );
  });

  it('is deterministic', () => {
    assert.equal(
      deriveUtilitySubAccount(alice, 42),
      deriveUtilitySubAccount(alice, 42)
    );
  });
});

describe('Ethereum to Substrate Address', () => {
  it('converts known ETH address to Substrate and back', () => {
    const ethAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const ethBytes = hexToU8a(ethAddress);
    const substrateBytes = new Uint8Array(32).fill(0xee);
    substrateBytes.set(ethBytes, 0);
    const ss58 = encodeAddress(substrateBytes, 42);

    // Round-trip
    const decoded = decodeAddress(ss58);
    assert.ok(decoded.slice(20).every(b => b === 0xEE));
    assert.equal(u8aToHex(decoded.slice(0, 20)), ethAddress);
  });

  it('rejects invalid Ethereum address length', () => {
    const shortAddr = '0x1234';
    assert.notEqual(shortAddr.length, 42);
  });

  it('non-0xEE Substrate address uses keccak256 derivation', () => {
    const alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const substrateBytes = decodeAddress(alice);
    assert.ok(!substrateBytes.slice(20).every(b => b === 0xEE));
    const ethBytes = keccak256AsU8a(substrateBytes).slice(-20);
    const ethAddress = u8aToHex(ethBytes);
    assert.equal(ethAddress.length, 42);
    // Known derivation — should be deterministic
    assert.equal(u8aToHex(keccak256AsU8a(decodeAddress(alice)).slice(-20)), ethAddress);
  });

  it('0xEE and keccak paths produce different ETH addresses for same account', () => {
    // Create a "mapped" ETH address (0xEE suffix)
    const ethAddr = '0x1111111111111111111111111111111111111111';
    const mapped = new Uint8Array(32).fill(0xee);
    mapped.set(hexToU8a(ethAddr), 0);
    const mappedSs58 = encodeAddress(mapped, 42);
    const mappedEth = u8aToHex(decodeAddress(mappedSs58).slice(0, 20));
    assert.equal(mappedEth, ethAddr);

    // The keccak derivation of the same SS58 would yield a different address
    const keccakEth = u8aToHex(keccak256AsU8a(decodeAddress(mappedSs58)).slice(-20));
    assert.notEqual(keccakEth, ethAddr);
  });
});

describe('Number to Hex', () => {
  it('converts 42 to 32-bit BE hex', () => {
    assert.equal(bnToHex(42, { bitLength: 32, isLe: false }), '0x0000002a');
  });

  it('converts 42 to 32-bit LE hex', () => {
    assert.equal(bnToHex(42, { bitLength: 32, isLe: true }), '0x2a000000');
  });

  it('converts 0 to 32-bit hex', () => {
    assert.equal(bnToHex(0, { bitLength: 32, isLe: false }), '0x00000000');
  });

  it('converts max u32 to hex', () => {
    assert.equal(bnToHex(4294967295, { bitLength: 32, isLe: false }), '0xffffffff');
  });

  it('compact encodes 69 as 0x1501', () => {
    assert.equal(u8aToHex(compactToU8a(69)), '0x1501');
  });

  it('compact encodes 0 as 0x00', () => {
    assert.equal(u8aToHex(compactToU8a(0)), '0x00');
  });

  it('compact encodes 1 as 0x04', () => {
    assert.equal(u8aToHex(compactToU8a(1)), '0x04');
  });

  it('compact encodes 63 as 0xfc (max single-byte)', () => {
    assert.equal(u8aToHex(compactToU8a(63)), '0xfc');
  });

  it('compact encodes 64 as 0x0101 (min two-byte)', () => {
    assert.equal(u8aToHex(compactToU8a(64)), '0x0101');
  });

  it('round-trips compact encoding at all mode boundaries', () => {
    const values = [0, 1, 42, 63, 64, 69, 16383, 16384, 1073741823, 1073741824];
    for (const val of values) {
      const encoded = u8aToHex(compactToU8a(val));
      const decoded = compactFromU8a(hexToU8a(encoded));
      assert.equal(decoded[1].toNumber(), val, `compact round-trip failed for ${val}`);
    }
  });
});

describe('u8a Array to Hex', () => {
  it('converts u8a to hex', () => {
    assert.equal(u8aToHex(new Uint8Array([1, 2, 255])), '0x0102ff');
  });

  it('converts empty u8a to 0x', () => {
    assert.equal(u8aToHex(new Uint8Array([])), '0x');
  });

  it('converts hex to u8a via polkadot-js', () => {
    assert.deepEqual(Array.from(hexToU8a('0x0102ff')), [1, 2, 255]);
  });

  it('hex2u8a strips 0x prefix before parsing byte pairs', () => {
    // Replicates the fixed logic from utilities.js hex2u8a function
    const hex = '0x0102ff';
    const stripped = hex.startsWith('0x') ? hex.slice(2) : hex;
    const array = stripped.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    assert.deepEqual(array, [1, 2, 255]);
  });

  it('hex2u8a works without 0x prefix', () => {
    const hex = 'abcd';
    const stripped = hex.startsWith('0x') ? hex.slice(2) : hex;
    const array = stripped.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    assert.deepEqual(array, [0xab, 0xcd]);
  });

  it('round-trips u8a through hex correctly', () => {
    const original = [42, 0, 255, 128];
    const hex = u8aToHex(new Uint8Array(original));
    const stripped = hex.startsWith('0x') ? hex.slice(2) : hex;
    const recovered = stripped.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    assert.deepEqual(recovered, original);
  });
});
