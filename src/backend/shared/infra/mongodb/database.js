export function getMongoUri() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Defina a variável MONGO_URI com a connection string do MongoDB.');
  }

  return uri;
}

export function getMongoTlsConfig() {
  return {
    allowInvalidCertificates: process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES === 'true',
    caFile: process.env.MONGO_TLS_CA_FILE || '',
  };
}

export function getMongoConnectionTarget() {
  try {
    const uri = getMongoUri();
    const parsedUri = new URL(uri);
    return `${parsedUri.protocol}//${parsedUri.host}${parsedUri.pathname}`;
  } catch {
    return 'mongodb://não-configurado';
  }
}

export function getMongoConfigDiagnostics() {
  const selectedVariable = process.env.MONGO_URI ? 'MONGO_URI' : process.env.MONGODB_URI ? 'MONGODB_URI' : 'none';
  const tlsConfig = getMongoTlsConfig();

  return {
    appEnv: process.env.APP_ENV || 'local',
    nodeEnv: process.env.NODE_ENV || 'development',
    hasMongoUri: Boolean(process.env.MONGO_URI),
    hasLegacyMongoDbUri: Boolean(process.env.MONGODB_URI),
    selectedVariable,
    target: getMongoConnectionTarget(),
    tlsAllowInvalidCertificates: tlsConfig.allowInvalidCertificates,
    hasTlsCaFile: Boolean(tlsConfig.caFile),
  };
}
