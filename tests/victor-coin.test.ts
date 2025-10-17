import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that token metadata is correctly set",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('victor-coin', 'get-name', [], deployer.address),
            Tx.contractCall('victor-coin', 'get-symbol', [], deployer.address),
            Tx.contractCall('victor-coin', 'get-decimals', [], deployer.address),
            Tx.contractCall('victor-coin', 'get-total-supply', [], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 4);
        assertEquals(block.receipts[0].result, '(ok "Victor Coin")');
        assertEquals(block.receipts[1].result, '(ok "VIC")');
        assertEquals(block.receipts[2].result, '(ok u6)');
        assertEquals(block.receipts[3].result, '(ok u1000000000000000)');
    },
});

Clarinet.test({
    name: "Ensure that deployer has the total supply initially",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('victor-coin', 'get-balance', [types.principal(deployer.address)], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok u1000000000000000)');
    },
});

Clarinet.test({
    name: "Ensure that transfer works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const transferAmount = 1000000; // 1 VIC with 6 decimals
        
        let block = chain.mineBlock([
            Tx.contractCall('victor-coin', 'transfer', [
                types.uint(transferAmount),
                types.principal(deployer.address),
                types.principal(wallet1.address),
                types.none()
            ], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok true)');
        
        // Check balances after transfer
        let balanceBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'get-balance', [types.principal(deployer.address)], deployer.address),
            Tx.contractCall('victor-coin', 'get-balance', [types.principal(wallet1.address)], wallet1.address),
        ]);
        
        assertEquals(balanceBlock.receipts[0].result, '(ok u999999999000000)');
        assertEquals(balanceBlock.receipts[1].result, `(ok u${transferAmount})`);
    },
});

Clarinet.test({
    name: "Ensure that transfer fails with insufficient balance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const transferAmount = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall('victor-coin', 'transfer', [
                types.uint(transferAmount),
                types.principal(wallet1.address),
                types.principal(wallet2.address),
                types.none()
            ], wallet1.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(err u1)'); // Insufficient funds error
    },
});

Clarinet.test({
    name: "Ensure that only contract owner can mint tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const mintAmount = 1000000;
        
        // Deployer (owner) can mint
        let block = chain.mineBlock([
            Tx.contractCall('victor-coin', 'mint', [
                types.uint(mintAmount),
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok true)');
        
        // Non-owner cannot mint
        let failBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'mint', [
                types.uint(mintAmount),
                types.principal(wallet1.address)
            ], wallet1.address),
        ]);
        
        assertEquals(failBlock.receipts.length, 1);
        assertEquals(failBlock.receipts[0].result, '(err u100)'); // Owner only error
    },
});

Clarinet.test({
    name: "Ensure that burn function works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const burnAmount = 1000000;
        
        // Get initial balance
        let initialBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'get-balance', [types.principal(deployer.address)], deployer.address),
        ]);
        
        // Burn tokens
        let burnBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'burn', [
                types.uint(burnAmount),
                types.principal(deployer.address)
            ], deployer.address),
        ]);
        
        assertEquals(burnBlock.receipts.length, 1);
        assertEquals(burnBlock.receipts[0].result, '(ok true)');
        
        // Check balance after burn
        let finalBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'get-balance', [types.principal(deployer.address)], deployer.address),
        ]);
        
        assertEquals(finalBlock.receipts[0].result, '(ok u999999999000000)');
    },
});

Clarinet.test({
    name: "Ensure that send-many function works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const amount1 = 1000000;
        const amount2 = 2000000;
        
        let block = chain.mineBlock([
            Tx.contractCall('victor-coin', 'send-many', [
                types.list([
                    types.tuple({
                        'to': types.principal(wallet1.address),
                        'amount': types.uint(amount1),
                        'memo': types.none()
                    }),
                    types.tuple({
                        'to': types.principal(wallet2.address),
                        'amount': types.uint(amount2),
                        'memo': types.none()
                    })
                ])
            ], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok true)');
        
        // Check balances
        let balanceBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'get-balance', [types.principal(wallet1.address)], wallet1.address),
            Tx.contractCall('victor-coin', 'get-balance', [types.principal(wallet2.address)], wallet2.address),
        ]);
        
        assertEquals(balanceBlock.receipts[0].result, `(ok u${amount1})`);
        assertEquals(balanceBlock.receipts[1].result, `(ok u${amount2})`);
    },
});

Clarinet.test({
    name: "Ensure that set-token-uri works for contract owner only",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const tokenUri = "https://victorcoin.io/metadata.json";
        
        // Owner can set URI
        let block = chain.mineBlock([
            Tx.contractCall('victor-coin', 'set-token-uri', [
                types.some(types.utf8(tokenUri))
            ], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok true)');
        
        // Verify URI was set
        let uriBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'get-token-uri', [], deployer.address),
        ]);
        
        assertEquals(uriBlock.receipts[0].result, `(ok (some u"${tokenUri}"))`);
        
        // Non-owner cannot set URI
        let failBlock = chain.mineBlock([
            Tx.contractCall('victor-coin', 'set-token-uri', [
                types.some(types.utf8("https://fake.com"))
            ], wallet1.address),
        ]);
        
        assertEquals(failBlock.receipts.length, 1);
        assertEquals(failBlock.receipts[0].result, '(err u100)'); // Owner only error
    },
});


import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("example tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  // it("shows an example", () => {
  //   const { result } = simnet.callReadOnlyFn("counter", "get-counter", [], address1);
  //   expect(result).toBeUint(0);
  // });
});
