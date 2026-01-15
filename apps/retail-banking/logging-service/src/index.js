const express = require('express');
const winston = require('winston');

const app = express();
app.use(express.json());

const serviceName = process.env.SERVICE_NAME || 'retail-logging-service';
const environment = process.env.ENVIRONMENT || 'local';
const port = Number(process.env.PORT || 8094);

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: serviceName, environment },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

function utcNowISO() {
  return new Date().toISOString();
}

// In-memory log store for demo
const logs = [];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

// Ingest logs from other services
app.post('/api/v1/logs', (req, res) => {
  const { level = 'info', message, service, metadata = {} } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  
  const logEntry = {
    timestamp: utcNowISO(),
    level,
    message,
    service: service || 'unknown',
    metadata,
    id: `LOG-${logs.length + 1}`
  };
  
  // Store in memory
  logs.push(logEntry);
  
  // Log with Winston
  logger.log(level, message, { service, metadata });
  
  res.status(201).json({ id: logEntry.id, timestamp: logEntry.timestamp });
});

// Query logs
app.get('/api/v1/logs', (req, res) => {
  const { service, level, limit = 100 } = req.query;
  
  let filteredLogs = logs;
  
  if (service) {
    filteredLogs = filteredLogs.filter(log => log.service === service);
  }
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  // Return most recent logs first
  filteredLogs = filteredLogs.slice(-limit).reverse();
  
  res.json({
    logs: filteredLogs,
    count: filteredLogs.length,
    as_of: utcNowISO()
  });
});

// Get log by ID
app.get('/api/v1/logs/:logId', (req, res) => {
  const { logId } = req.params;
  const log = logs.find(l => l.id === logId);
  
  if (!log) {
    return res.status(404).json({ error: 'Log not found' });
  }
  
  res.json(log);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`${serviceName} listening on :${port} (env=${environment})`);
});
