import { checkMongoConnection } from '@/backend/shared/infra/mongodb/connect';
import { getMongoConfigDiagnostics, getMongoConnectionTarget } from '@/backend/shared/infra/mongodb/database';
import { json } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  console.info('[mongo:v2] Health endpoint requested.', getMongoConfigDiagnostics());

  try {
    const health = await checkMongoConnection();
    console.info('[mongo:v2] Health endpoint succeeded.', health);
    return json({ service: 'mongo', ...health });
  } catch (error) {
    console.error('[mongo:v2] Health endpoint failed.', {
      ...getMongoConfigDiagnostics(),
      name: error?.name,
      code: error?.code,
      causeName: error?.cause?.name,
      causeCode: error?.cause?.code,
      causeMessage: error?.cause?.message,
      reason: error?.reason?.message,
      message: error?.message,
    });

    return json(
      {
        service: 'mongo',
        ok: false,
        error: 'Não foi possível conectar ao MongoDB.',
        target: getMongoConnectionTarget(),
        details: error.message,
      },
      { status: 503 },
    );
  }
}
