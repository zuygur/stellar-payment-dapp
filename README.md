# Stellar Payment dApp

A simple decentralized application built on the Stellar Testnet that allows users to connect their Freighter wallet, view their XLM balance, and send XLM payments to other accounts.

This project was built as part of Level 1 of the Rise In Stellar Journey to Mastery program.

## Features

- Connect and disconnect a Freighter wallet
- Fetch and display the connected wallet's XLM balance
- Send XLM payments to any Stellar Testnet address
- Show clear success or failure feedback for each transaction, including the transaction hash

## Tech Stack

- React (Vite)
- @stellar/freighter-api
- @stellar/stellar-sdk
- Stellar Testnet / Horizon

## Setup Instructions

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

## Screenshots

### Wallet Connected State and Balance Display
![Wallet connected state and balance display](screenshots/wallet%20connected%20state%20and%20balance%20display.png)

### Successful Testnet Transaction and Transaction Result
![Successful testnet transaction and transaction result](screenshots/successful%20testnet%20transaction%20and%20transaction%20result.png)

### Freighter Wallet
![Freighter wallet](screenshots/freighter%20wallet.png)

## Notes

- The recipient account must already exist (funded) on the Testnet for a payment to succeed. New accounts can be funded using [Friendbot](https://friendbot.stellar.org/).