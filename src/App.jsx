import { useState } from 'react'
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api'
import { Horizon, TransactionBuilder, Networks, Operation, Asset } from '@stellar/stellar-sdk'
import './App.css'

function App() {
  const [walletAddress, setWalletAddress] = useState(null)
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txResult, setTxResult] = useState(null)

  async function fetchBalance(address) {
    try {
      const server = new Horizon.Server('https://horizon-testnet.stellar.org')
      const account = await server.loadAccount(address)

      const xlmBalance = account.balances.find(
        (b) => b.asset_type === 'native'
      )

      setBalance(xlmBalance.balance)
    } catch (err) {
      console.error(err)
      setError('Could not fetch balance. Please try again.')
    }
  }

  async function handleConnect() {
    setError(null)

    const connectionCheck = await isConnected()
    if (!connectionCheck.isConnected) {
      setError('Freighter does not seem to be installed. Please check the extension.')
      return
    }

    const accessObj = await requestAccess()
    if (accessObj.error) {
      setError('Connection was rejected or an error occurred.')
      return
    }

    setWalletAddress(accessObj.address)
    fetchBalance(accessObj.address)
  }

  function handleDisconnect() {
    setWalletAddress(null)
    setBalance(null)
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Stellar Payment dApp</h1>

      {!walletAddress ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected wallet: {walletAddress}</p>
          <p>Balance: {balance ? `${balance} XLM` : 'Loading...'}</p>
          <div style={{ marginTop: '20px' }}>
            <h3>Send Payment</h3>
            <input
              type="text"
              placeholder="Recipient address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <br />
            <input
              type="text"
              placeholder="Amount (XLM)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <br />
            <button onClick={handleSendPayment}>Send Payment</button>

            {txResult && txResult.success && (
              <p style={{ color: 'green' }}>
                Transaction successful! Hash: {txResult.hash}
              </p>
            )}
            {txResult && !txResult.success && (
              <p style={{ color: 'red' }}>Transaction failed.</p>
            )}
        </div>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )

  async function handleSendPayment() {
  setError(null)
  setTxResult(null)

  try {
    const server = new Horizon.Server('https://horizon-testnet.stellar.org')
    const sourceAccount = await server.loadAccount(walletAddress)

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: recipient,
          asset: Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(30)
      .build()

    const xdr = transaction.toXDR()

    const signedResult = await signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    })

    const signedTransaction = TransactionBuilder.fromXDR(
      signedResult.signedTxXdr,
      Networks.TESTNET
    )

    const result = await server.submitTransaction(signedTransaction)

    setTxResult({ success: true, hash: result.hash })
    fetchBalance(walletAddress)
  } catch (err) {
    console.error(err)
    setTxResult({ success: false })
    setError('Transaction failed. Please check the address and amount.')
  }
  }
}

export default App