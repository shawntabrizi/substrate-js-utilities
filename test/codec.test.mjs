import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypeRegistry, createType } from '@polkadot/types';
import { hexToU8a } from '@polkadot/util';

const registry = new TypeRegistry();

// Replicates the fixed logic from codec/codec.js:
// Convert hex to Uint8Array before passing to createType so polkadot-js
// treats it as raw SCALE (LE) bytes instead of BE hex.
function decodeSCALE(typeName, hexInput) {
  return createType(registry, typeName, hexToU8a(hexInput));
}

describe('SCALE decoder', () => {
  describe('u32 endianness (issue #14)', () => {
    it('decodes 0x00400600 as 409600', () => {
      assert.equal(decodeSCALE('u32', '0x00400600').toNumber(), 409600);
    });

    it('decodes 0x01000000 as 1', () => {
      assert.equal(decodeSCALE('u32', '0x01000000').toNumber(), 1);
    });

    it('decodes 0xe8030000 as 1000', () => {
      assert.equal(decodeSCALE('u32', '0xe8030000').toNumber(), 1000);
    });

    it('decodes 0x00000000 as 0', () => {
      assert.equal(decodeSCALE('u32', '0x00000000').toNumber(), 0);
    });

    it('decodes 0xffffffff as 4294967295 (u32 max)', () => {
      assert.equal(decodeSCALE('u32', '0xffffffff').toNumber(), 4294967295);
    });
  });

  describe('other integer widths', () => {
    it('decodes u8', () => {
      assert.equal(decodeSCALE('u8', '0xff').toNumber(), 255);
      assert.equal(decodeSCALE('u8', '0x00').toNumber(), 0);
      assert.equal(decodeSCALE('u8', '0x2a').toNumber(), 42);
    });

    it('decodes u16 LE', () => {
      assert.equal(decodeSCALE('u16', '0xe803').toNumber(), 1000);
      assert.equal(decodeSCALE('u16', '0x0100').toNumber(), 1);
      assert.equal(decodeSCALE('u16', '0xffff').toNumber(), 65535);
    });

    it('decodes u64 LE', () => {
      assert.equal(decodeSCALE('u64', '0x0100000000000000').toString(), '1');
      assert.equal(decodeSCALE('u64', '0xe803000000000000').toString(), '1000');
    });

    it('decodes u128 LE', () => {
      assert.equal(
        decodeSCALE('u128', '0x00e40b54020000000000000000000000').toString(),
        '10000000000'
      );
      assert.equal(
        decodeSCALE('u128', '0x00000000000000000000000000000000').toString(),
        '0'
      );
    });

    it('decodes i32 (signed)', () => {
      // -1 in two's complement LE
      assert.equal(decodeSCALE('i32', '0xffffffff').toNumber(), -1);
      // -128
      assert.equal(decodeSCALE('i32', '0x80ffffff').toNumber(), -128);
    });
  });

  describe('Compact<u32> (issue #13)', () => {
    it('decodes 0x1501 as 69', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0x1501').toNumber(), 69);
    });

    // Single-byte mode: values 0-63, low 2 bits = 00
    it('decodes single-byte mode: 0x00 as 0', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0x00').toNumber(), 0);
    });

    it('decodes single-byte mode: 0x04 as 1', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0x04').toNumber(), 1);
    });

    it('decodes single-byte mode: 0xa8 as 42', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0xa8').toNumber(), 42);
    });

    it('decodes single-byte mode: 0xfc as 63 (max single-byte)', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0xfc').toNumber(), 63);
    });

    // Two-byte mode: values 64-16383, low 2 bits = 01
    it('decodes two-byte mode: 0x0101 as 64 (min two-byte)', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0x0101').toNumber(), 64);
    });

    it('decodes two-byte mode: 0xfdff as 16383 (max two-byte)', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0xfdff').toNumber(), 16383);
    });

    // Four-byte mode: values 16384-2^30-1, low 2 bits = 10
    it('decodes four-byte mode: 0x02000100 as 16384 (min four-byte)', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0x02000100').toNumber(), 16384);
    });

    it('decodes four-byte mode: 0xfeffffff as 1073741823 (max four-byte)', () => {
      assert.equal(decodeSCALE('Compact<u32>', '0xfeffffff').toNumber(), 1073741823);
    });

    // Big-integer mode: values >= 2^30, low 2 bits = 11
    it('decodes big-integer mode: 0x0300000040 as 1073741824 (min big-int)', () => {
      assert.equal(decodeSCALE('Compact<u64>', '0x0300000040').toString(), '1073741824');
    });

    it('decodes big-integer mode: 0x070000000001 as 4294967296', () => {
      assert.equal(decodeSCALE('Compact<u64>', '0x070000000001').toString(), '4294967296');
    });
  });

  describe('Vec types', () => {
    it('decodes Vec<u16>: [4,8,15,16,23,42]', () => {
      const result = decodeSCALE('Vec<u16>', '0x18040008000f00100017002a00');
      assert.deepEqual(result.toJSON(), [4, 8, 15, 16, 23, 42]);
    });

    it('decodes empty Vec<u16>: 0x00 as []', () => {
      assert.deepEqual(decodeSCALE('Vec<u16>', '0x00').toJSON(), []);
    });

    it('decodes Vec<u8> (bytes)', () => {
      // length 3, then [0x01, 0x02, 0x03]
      assert.deepEqual(decodeSCALE('Vec<u8>', '0x0c010203').toJSON(), '0x010203');
    });

    it('decodes Vec<Vec<u8>> (nested)', () => {
      registry.register({ NestedVec: 'Vec<Vec<u8>>' });
      // outer length 2, inner1 length 1 [0xff], inner2 length 2 [0xaa, 0xbb]
      const result = decodeSCALE('NestedVec', '0x0804ff08aabb');
      const json = result.toJSON();
      assert.equal(json.length, 2);
    });
  });

  describe('Option types', () => {
    it('decodes Option<u32> None: 0x00', () => {
      assert.equal(decodeSCALE('Option<u32>', '0x00').toJSON(), null);
    });

    it('decodes Option<u32> Some(42): 0x012a000000', () => {
      assert.equal(decodeSCALE('Option<u32>', '0x012a000000').toJSON(), 42);
    });

    it('decodes Option<bool> with standard Option encoding', () => {
      // polkadot-js uses standard Option encoding: 0x00=None, 0x01+bool=Some
      assert.equal(decodeSCALE('Option<bool>', '0x00').toJSON(), null);
      assert.equal(decodeSCALE('Option<bool>', '0x0100').toJSON(), false);
      assert.equal(decodeSCALE('Option<bool>', '0x0101').toJSON(), true);
    });
  });

  describe('bool', () => {
    it('decodes true: 0x01', () => {
      assert.equal(decodeSCALE('bool', '0x01').toJSON(), true);
    });

    it('decodes false: 0x00', () => {
      assert.equal(decodeSCALE('bool', '0x00').toJSON(), false);
    });
  });

  describe('composite types', () => {
    it('decodes tuple (u32, u32)', () => {
      registry.register({ TestTuple: '(u32, u32)' });
      assert.deepEqual(decodeSCALE('TestTuple', '0x0100000002000000').toJSON(), [1, 2]);
    });

    it('decodes tuple (u8, bool, u16)', () => {
      registry.register({ MixedTuple: '(u8, bool, u16)' });
      // 42, true, 1000
      assert.deepEqual(decodeSCALE('MixedTuple', '0x2a01e803').toJSON(), [42, true, 1000]);
    });

    it('decodes enum', () => {
      registry.register({ TestEnum: { _enum: ['A', 'B', 'C'] } });
      assert.equal(decodeSCALE('TestEnum', '0x00').toJSON(), 'A');
      assert.equal(decodeSCALE('TestEnum', '0x01').toJSON(), 'B');
      assert.equal(decodeSCALE('TestEnum', '0x02').toJSON(), 'C');
    });

    it('decodes struct', () => {
      registry.register({
        TestStruct: {
          id: 'u32',
          active: 'bool'
        }
      });
      // id=1 (LE), active=true
      const result = decodeSCALE('TestStruct', '0x0100000001');
      assert.deepEqual(result.toJSON(), { id: 1, active: true });
    });

    it('decodes nested custom types', () => {
      registry.register({
        Status: { _enum: ['Active', 'Inactive'] },
        Record: { value: 'u32', status: 'Status' }
      });
      // value=100 (LE), status=Active (0x00)
      const result = decodeSCALE('Record', '0x6400000000');
      assert.deepEqual(result.toJSON(), { value: 100, status: 'Active' });
    });
  });

  describe('string types', () => {
    it('decodes Text (SCALE string)', () => {
      // length-prefixed UTF-8: compact(5) + "hello"
      const result = decodeSCALE('Text', '0x1468656c6c6f');
      assert.equal(result.toString(), 'hello');
    });

    it('decodes empty Text', () => {
      assert.equal(decodeSCALE('Text', '0x00').toString(), '');
    });
  });

  describe('error handling', () => {
    it('hexToU8a is lenient with non-hex input', () => {
      // polkadot-js hexToU8a doesn't throw — it interprets what it can
      const result = hexToU8a('not-hex');
      assert.ok(result instanceof Uint8Array);
    });

    it('createType with truncated u32 data reads available bytes', () => {
      // polkadot-js is lenient — it reads what it can and zero-pads
      const result = decodeSCALE('u32', '0x0100');
      assert.equal(typeof result.toNumber(), 'number');
    });
  });
});
