# Stellar Payment dApp

A decentralized application built on the Stellar Testnet that allows users to connect a Freighter wallet, view their XLM balance, and send payments through a deployed Soroban smart contract that tracks payment status.

This project was built for the Rise In Stellar Journey to Mastery program (Level 1 - White Belt and Level 2 - Yellow Belt).

## Features

- Connect and disconnect a Freighter wallet
- Fetch and display the connected wallet's XLM balance
- Send XLM payments through a deployed Soroban smart contract
- Each payment is recorded on-chain with a unique payment ID and a status (`pending` / `completed`)
- Clear success or failure feedback for each transaction, including the payment ID and transaction hash
- Handles multiple distinct error cases: invalid recipient address, invalid amount, and network/contract failures

## Tech Stack

- React (Vite)
- @stellar/freighter-api
- @stellar/stellar-sdk
- Soroban (Stellar smart contracts, written in Rust)
- Stellar Testnet / Horizon / Soroban RPC

## Smart Contract

The `payment-tracker-contract` folder contains a Soroban smart contract with three functions:

- `create_payment` — creates a new payment record with sender, recipient, amount, and a `pending` status
- `complete_payment` — updates a payment record's status to `completed`
- `get_payment` — retrieves a payment record by its ID

**Deployed Contract ID (Testnet):**

```bash
CA64JOQVE6HTDF4KE3JSK7OUZBEKTPIC5TQH52PDAM5DHYKBKXKEXE7Q
```
You can verify the contract on [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet/contract/CA64JOQVE6HTDF4KE3JSK7OUZBEKTPIC5TQH52PDAM5DHYKBKXKEXE7Q).

## Setup Instructions

### Frontend

1. Clone this repository:

```bash
git clone https://github.com/zuygur/stellar-payment-dapp.git
```

2. Navigate into the project folder:

```bash
cd stellar-payment-dapp
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open the local address shown in the terminal (usually `http://localhost:5173`) in your browser.

6. Make sure the [Freighter wallet extension](https://www.freighter.app/) is installed and set to **Testnet**.

### Smart Contract (optional — already deployed)

If you want to build or redeploy the contract yourself:

1. Install [Rust](https://www.rust-lang.org/tools/install) and the [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools#stellar-cli).

2. Add the WASM build target:

```bash
rustup target add wasm32v1-none
```

3. Navigate into the contract folder:

```bash
cd payment-tracker-contract
```

4. Build the contract:

```bash
stellar contract build
```

5. Deploy to testnet:

```bash
stellar contract deploy --wasm target/wasm32v1-none/release/hello_world.wasm --source <your-identity> --network testnet
```

## Screenshots

### Wallet Connected State and Balance Display
![Wallet connected state and balance display](screenshots/wallet%20connected%20state%20and%20balance%20display.png)

### Successful Testnet Transaction and Transaction Result
![Successful testnet transaction and transaction result](screenshots/successful%20testnet%20transaction%20and%20transaction%20result.png)

### Freighter Wallet
![Freighter wallet](screenshots/freighter%20wallet.png)

## Notes

- The recipient account must already exist (funded) on the Testnet for a payment to succeed. New accounts can be funded using [Friendbot](https://friendbot.stellar.org/).
- Contract calls require higher network fees than simple payments, since they involve on-chain computation.