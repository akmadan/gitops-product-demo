const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const serviceName = process.env.SERVICE_NAME || 'retail-banking-api';
const environment = process.env.ENVIRONMENT || 'local';
const port = Number(process.env.PORT || 8090);

function utcNowISO() {
  return new Date().toISOString();
}

// In-memory stores for demo
const accounts = new Map();
const transactions = new Map();

// Initialize mock accounts
const mockAccounts = [
  { customerId: 'CUST-001', accountNumber: 'ACC-1001', balance: 5420.75, currency: 'USD', status: 'ACTIVE' },
  { customerId: 'CUST-002', accountNumber: 'ACC-1002', balance: 12850.20, currency: 'USD', status: 'ACTIVE' },
  { customerId: 'CUST-003', accountNumber: 'ACC-1003', balance: 3200.00, currency: 'USD', status: 'ACTIVE' }
];

mockAccounts.forEach(acc => {
  const accountId = uuidv4();
  accounts.set(accountId, { ...acc, accountId, createdAt: utcNowISO(), updatedAt: utcNowISO() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

// Get all accounts
app.get('/api/v1/accounts', (req, res) => {
  const { customerId } = req.query;
  let accs = Array.from(accounts.values());
  if (customerId) {
    accs = accs.filter(a => a.customerId === customerId);
  }
  res.json({ accounts: accs, count: accs.length, as_of: utcNowISO() });
});

// Get account by ID
app.get('/api/v1/accounts/:accountId', (req, res) => {
  const { accountId } = req.params;
  const account = accounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json(account);
});

// Create account
app.post('/api/v1/accounts', (req, res) => {
  const { customerId, accountNumber, initialBalance = 0, currency = 'USD' } = req.body;
  if (!customerId || !accountNumber) {
    return res.status(400).json({ error: 'customerId and accountNumber are required' });
  }
  
  const accountId = uuidv4();
  const account = {
    accountId,
    customerId,
    accountNumber,
    balance: initialBalance,
    currency,
    status: 'ACTIVE',
    createdAt: utcNowISO(),
    updatedAt: utcNowISO()
  };
  
  accounts.set(accountId, account);
  res.status(201).json(account);
});

// Get transactions
app.get('/api/v1/transactions', (req, res) => {
  const { accountId, customerId } = req.query;
  let txns = Array.from(transactions.values());
  
  if (accountId) {
    txns = txns.filter(t => t.accountId === accountId);
  } else if (customerId) {
    const customerAccounts = Array.from(accounts.values()).filter(a => a.customerId === customerId);
    const customerAccountIds = customerAccounts.map(a => a.accountId);
    txns = txns.filter(t => customerAccountIds.includes(t.accountId));
  }
  
  res.json({ transactions: txns, count: txns.length, as_of: utcNowISO() });
});

// Create transaction
app.post('/api/v1/transactions', (req, res) => {
  const { accountId, amount, type, description } = req.body;
  if (!accountId || !amount || !type) {
    return res.status(400).json({ error: 'accountId, amount, and type are required' });
  }
  
  const account = accounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  const transactionId = uuidv4();
  const transaction = {
    transactionId,
    accountId,
    amount: Number(amount),
    type, // DEBIT or CREDIT
    description: description || '',
    status: 'COMPLETED',
    createdAt: utcNowISO()
  };
  
  // Update account balance
  if (type === 'DEBIT') {
    account.balance -= Number(amount);
  } else {
    account.balance += Number(amount);
  }
  account.updatedAt = utcNowISO();
  
  transactions.set(transactionId, transaction);
  res.status(201).json(transaction);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`${serviceName} listening on :${port} (env=${environment})`);
});
