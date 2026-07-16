import { useState } from 'react'
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api'
import { Horizon, TransactionBuilder, Networks, Contract, nativeToScVal, Address, rpc} from '@stellar/stellar-sdk'
import './App.css'

const CONTRACT_ID = 'CA64JOQVE6HTDF4KE3JSK7OUZBEKTPIC5TQH52PDAM5DHYKBKXKEXE7Q'

function generatePaymentId() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return timestamp * 1000 + random
}

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
                Transaction successful!<br />
                Payment ID: {txResult.paymentId}<br />
                Hash: {txResult.hash}
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

  // Error type 1: invalid recipient address
  if (!recipient || recipient.length !== 56 || !recipient.startsWith('G')) {
    setError('Invalid recipient address. Stellar addresses start with "G" and are 56 characters long.')
    return
  }

  // Error type 2: invalid amount
  const amountNumber = Number(amount)
  if (!amount || isNaN(amountNumber) || amountNumber <= 0) {
    setError('Invalid amount. Please enter a number greater than 0.')
    return
  }

  try {
    const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org')
    const rpcServer = new rpc.Server('https://soroban-testnet.stellar.org')

    const sourceAccount = await horizonServer.loadAccount(walletAddress)

    const paymentId = generatePaymentId()
    const contract = new Contract(CONTRACT_ID)

    const operation = contract.call(
      'create_payment',
      nativeToScVal(paymentId, { type: 'u64' }),
      new Address(walletAddress).toScVal(),
      new Address(recipient).toScVal(),
      nativeToScVal(BigInt(amount) * 10000000n, { type: 'i128' })
    )

    const builtTransaction = new TransactionBuilder(sourceAccount, {
      fee: '1000000',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    const preparedTransaction = await rpcServer.prepareTransaction(builtTransaction)

    const xdr = preparedTransaction.toXDR()

    const signedResult = await signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    })

    const signedTransaction = TransactionBuilder.fromXDR(
      signedResult.signedTxXdr,
      Networks.TESTNET
    )

    const sendResponse = await rpcServer.sendTransaction(signedTransaction)

    if (sendResponse.status === 'ERROR') {
      throw new Error('Transaction submission failed')
    }

    let txResponse = await rpcServer.getTransaction(sendResponse.hash)
    while (txResponse.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      txResponse = await rpcServer.getTransaction(sendResponse.hash)
    }

    if (txResponse.status === 'SUCCESS') {
      setTxResult({ success: true, hash: sendResponse.hash, paymentId })
      fetchBalance(walletAddress)
    } else {
      setTxResult({ success: false })
      setError('Contract call did not succeed on the network.')
    }
  } catch (err) {
    console.error(err)
    setTxResult({ success: false })

    // Error type 3: network / contract-level failure
    if (err.message && err.message.includes('insufficient')) {
      setError('Insufficient balance to complete this transaction.')
    } else {
      setError('The contract call failed on the network. Please try again.')
    }
  }
}
}

export default App