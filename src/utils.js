export function generatePaymentId() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return timestamp * 1000 + random
}

export function isValidRecipient(recipient) {
  return Boolean(recipient) && recipient.length === 56 && recipient.startsWith('G')
}

export function isValidAmount(amount) {
  const amountNumber = Number(amount)
  return Boolean(amount) && !isNaN(amountNumber) && amountNumber > 0
}