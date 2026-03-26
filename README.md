# Substrate JS Utilities

A collection of browser-based utilities for working with [Substrate](https://substrate.io/) and [Polkadot](https://polkadot.network/) data. No build step required — just static HTML and JavaScript.

**Live site: [shawntabrizi.com/substrate-js-utilities](https://www.shawntabrizi.com/substrate-js-utilities/)**

## Utilities

### Main Page

- **String to Hex** — Bidirectional string/hex conversion
- **Balance to Hex** — Number to little-endian hex conversion
- **AccountId to Hex** — SS58 address to raw hex bytes
- **Blake2 Hash** — Blake2b hashing with configurable bit length
- **Blake2 Concat** — Blake2b hash concatenated with input
- **XXHash** — TwoX hashing with configurable bit length
- **XXHash Concat** — TwoX hash concatenated with input
- **Seed to Address** — Generate SS58 address from a seed phrase
- **Change Address Prefix** — Convert addresses between network prefixes
- **Module ID to Address** — Convert a pallet ID to its sovereign account
- **Pallet ID Sub-Account** — Derive pallet sub-accounts from a pallet ID and index
- **Para ID to Address** — Derive parachain sovereign accounts (child or sibling)
- **Sub-Account Generator** — Derive Utility pallet sub-accounts
- **Ethereum to Substrate Address** — Bidirectional ETH/Substrate address conversion
- **u8a Array to Hex** — Convert byte arrays to hex and back
- **Number to Hex** — Configurable bit length, endianness, and SCALE compact encoding

### Additional Pages

- **[SCALE Decoder](https://www.shawntabrizi.com/substrate-js-utilities/codec/)** — Decode raw SCALE-encoded hex bytes with custom type definitions
- **[Query Indices](https://www.shawntabrizi.com/substrate-js-utilities/indices/)** — Batch query account indices from a live chain
- **[Network Versions](https://www.shawntabrizi.com/substrate-js-utilities/versions/)** — Query runtime versions across multiple networks
- **[Query Nominations](https://www.shawntabrizi.com/substrate-js-utilities/nominations/)** — View staking nominations and estimate rewards
- **[Event Counter](https://www.shawntabrizi.com/substrate-js-utilities/event-count/)** — Count and graph blockchain events across block ranges

## Development

No build step needed. The site runs as static files with dependencies loaded via CDN.

### Running Tests

```bash
npm install
npm test
```

Tests use Node's built-in test runner and cover all utility logic (SCALE encoding/decoding, address derivation, hashing, conversions, etc.).

## License

[MIT](LICENSE)
