# Victor Coin (VIC)

A decentralized digital currency built on the Stacks blockchain implementing the SIP-010 fungible token standard.

## Overview

Victor Coin is a fungible token that provides a secure, decentralized digital currency with the following features:

- **SIP-010 Compliant**: Fully implements the Stacks Improvement Proposal 010 for fungible tokens
- **Fixed Supply**: 1 billion tokens (1,000,000,000 VIC) with 6 decimal places
- **Secure**: Built with Clarity smart contract language for maximum security
- **Transferable**: Standard transfer functionality with memo support
- **Burnable**: Token holders can burn their tokens to reduce supply
- **Batch Operations**: Send tokens to multiple recipients in a single transaction

## Token Details

- **Name**: Victor Coin
- **Symbol**: VIC
- **Decimals**: 6
- **Total Supply**: 1,000,000,000 VIC (1,000,000,000,000,000 micro-units)
- **Blockchain**: Stacks
- **Contract Language**: Clarity

## Smart Contract Functions

### SIP-010 Standard Functions

- `transfer(amount, sender, recipient, memo)` - Transfer tokens between addresses
- `get-name()` - Returns the token name
- `get-symbol()` - Returns the token symbol  
- `get-decimals()` - Returns the number of decimals
- `get-balance(who)` - Returns the balance of an address
- `get-total-supply()` - Returns the total token supply
- `get-token-uri()` - Returns the token metadata URI

### Additional Functions

- `mint(amount, recipient)` - Mint new tokens (owner only)
- `burn(amount, owner)` - Burn tokens to reduce supply
- `send-many(recipients)` - Send tokens to multiple addresses in one transaction
- `set-token-uri(uri)` - Set the token metadata URI (owner only)
- `get-owner()` - Returns the contract owner address

## Project Structure

```
victorcoin/
├── contracts/
│   └── victor-coin.clar          # Main token contract
├── tests/
│   └── victor-coin.test.ts       # Comprehensive test suite
├── settings/
│   ├── Devnet.toml              # Development network settings
│   ├── Testnet.toml             # Testnet settings
│   └── Mainnet.toml             # Mainnet settings
├── Clarinet.toml                # Clarinet configuration
├── package.json                 # Node.js dependencies
├── tsconfig.json                # TypeScript configuration
├── vitest.config.js             # Test configuration
└── README.md                    # This file
```

## Getting Started

### Prerequisites

- [Clarinet](https://docs.hiro.so/clarinet) - Stacks development environment
- [Node.js](https://nodejs.org/) (v16 or higher) - For running tests
- [Stacks Wallet](https://wallet.hiro.so/) - For interacting with the contract

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/victorcoin.git
   cd victorcoin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

#### Check Contract Syntax
```bash
clarinet check
```

#### Run Tests
```bash
npm test
```

#### Start Development Console
```bash
clarinet console
```

#### Deploy to Development Network
```bash
clarinet integrate
```

## Testing

The project includes a comprehensive test suite that covers:

- Token metadata verification
- Initial supply distribution
- Transfer functionality
- Error handling (insufficient balance, unauthorized access)
- Minting permissions
- Burning functionality
- Batch transfer operations
- URI management

Run tests with:
```bash
npm test
```

## Deployment

### Testnet Deployment

1. Configure your testnet settings in `settings/Testnet.toml`
2. Deploy using Clarinet:
   ```bash
   clarinet publish --testnet
   ```

### Mainnet Deployment

1. Configure your mainnet settings in `settings/Mainnet.toml`
2. Deploy using Clarinet:
   ```bash
   clarinet publish --mainnet
   ```

## Usage Examples

### Transfer Tokens
```clarity
;; Transfer 1 VIC (1,000,000 micro-units) from sender to recipient
(contract-call? .victor-coin transfer u1000000 tx-sender 'SP1RECIPIENT123 none)
```

### Check Balance
```clarity
;; Check balance of an address
(contract-call? .victor-coin get-balance 'SP1ADDRESS123)
```

### Burn Tokens
```clarity
;; Burn 0.5 VIC (500,000 micro-units)
(contract-call? .victor-coin burn u500000 tx-sender)
```

### Batch Transfer
```clarity
;; Send tokens to multiple recipients
(contract-call? .victor-coin send-many [
  {to: 'SP1RECIPIENT1, amount: u1000000, memo: none}
  {to: 'SP1RECIPIENT2, amount: u2000000, memo: none}
])
```

## Security Considerations

- The contract owner has special privileges (minting, URI setting)
- Only token owners can burn their tokens
- All transfers require proper authorization
- The contract uses Clarity's built-in safety features
- Total supply is fixed at deployment

## Error Codes

- `u100` - Owner only operation
- `u101` - Not token owner
- `u102` - Insufficient balance
- `u103` - Invalid amount (zero or negative)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or support:

- Open an issue on GitHub
- Join the Stacks community Discord
- Check the [Stacks documentation](https://docs.stacks.co/)

## Roadmap

- [x] Basic SIP-010 implementation
- [x] Comprehensive test suite
- [x] Batch transfer functionality
- [ ] Token metadata and branding
- [ ] Integration with DeFi protocols
- [ ] Governance features
- [ ] Cross-chain compatibility

---

**Disclaimer**: This is experimental software. Use at your own risk. Always test thoroughly before deploying to mainnet.
 
