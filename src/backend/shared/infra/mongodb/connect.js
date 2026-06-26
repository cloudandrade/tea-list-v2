import mongoose from 'mongoose';
import { getMongoConfigDiagnostics, getMongoConnectionTarget, getMongoTlsConfig, getMongoUri } from './database';

const globalCache = globalThis.__teaListV2Mongoose || { conn: null, promise: null };

if (!globalThis.__teaListV2Mongoose) {
  globalThis.__teaListV2Mongoose = globalCache;
}

function logMongoInfo(message, data = {}) {
  console.info(`[mongo:v2] ${message}`, data);
}

function logMongoError(message, error, data = {}) {
  console.error(`[mongo:v2] ${message}`, {
    ...data,
    name: error?.name,
    code: error?.code,
    causeName: error?.cause?.name,
    causeCode: error?.cause?.code,
    causeMessage: error?.cause?.message,
    reason: error?.reason?.message,
    message: error?.message,
  });
}

function buildMongoConnectOptions() {
  const tlsConfig = getMongoTlsConfig();
  const options = {
    serverSelectionTimeoutMS: 10000,
  };

  if (tlsConfig.allowInvalidCertificates) {
    options.tlsAllowInvalidCertificates = true;
  }

  if (tlsConfig.caFile) {
    options.tlsCAFile = tlsConfig.caFile;
  }

  return options;
}

export async function connectMongo() {
  if (globalCache.conn) {
    logMongoInfo('Reusing cached MongoDB connection.', {
      readyState: globalCache.conn.connection.readyState,
      target: getMongoConnectionTarget(),
    });
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    const uri = getMongoUri();
    const diagnostics = getMongoConfigDiagnostics();

    logMongoInfo('Starting MongoDB connection.', diagnostics);

    globalCache.promise = mongoose
      .connect(uri, buildMongoConnectOptions())
      .then((mongooseInstance) => {
        logMongoInfo('MongoDB connection established.', {
          database: mongooseInstance.connection.name,
          host: mongooseInstance.connection.host,
          readyState: mongooseInstance.connection.readyState,
          target: diagnostics.target,
        });

        return mongooseInstance;
      });
  }

  try {
    globalCache.conn = await globalCache.promise;
    return globalCache.conn;
  } catch (error) {
    logMongoError('MongoDB connection failed.', error, getMongoConfigDiagnostics());
    globalCache.promise = null;
    throw error;
  }
}

export async function checkMongoConnection() {
  logMongoInfo('Running MongoDB health check.', getMongoConfigDiagnostics());
  const mongooseInstance = await connectMongo();
  await mongooseInstance.connection.db.admin().ping();

  logMongoInfo('MongoDB health check passed.', {
    database: mongooseInstance.connection.name,
    host: mongooseInstance.connection.host,
    readyState: mongooseInstance.connection.readyState,
    target: getMongoConnectionTarget(),
  });

  return {
    ok: true,
    database: mongooseInstance.connection.name,
    host: mongooseInstance.connection.host,
    target: getMongoConnectionTarget(),
    readyState: mongooseInstance.connection.readyState,
  };
}
