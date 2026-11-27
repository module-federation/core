import { createDeploymentClient, SNAPSHOT_EXPIRED_CODE } from './client';
import type { DeploymentDiscoveryContext, DeploymentStore } from './types';

export interface DiscoveryHandlerOptions {
  rootSource: string;
  readDeployment: DeploymentStore['read'];
  getConsumerContext?: (request: Request) =>
    | Promise<
        Partial<DeploymentDiscoveryContext> & {
          source?: string;
          deploymentId?: string;
        }
      >
    | (Partial<DeploymentDiscoveryContext> & {
        source?: string;
        deploymentId?: string;
      });
}

/**
 * Standard Web Request -> Response HTTP handler wrapping deployment reads for
 * BFF / Serverless / Edge discovery endpoints.
 */
export function createDiscoveryHandler(options: DiscoveryHandlerOptions) {
  const { rootSource, readDeployment, getConsumerContext } = options;

  return async function handleDiscoveryRequest(
    request: Request,
  ): Promise<Response> {
    try {
      let body: Record<string, unknown> = {};
      if (request.method === 'POST') {
        body = (await request.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
      }
      const url = new URL(request.url);
      const custom = getConsumerContext
        ? await getConsumerContext(request)
        : undefined;

      const source =
        custom?.source ??
        (typeof body.source === 'string' ? body.source : undefined) ??
        url.searchParams.get('source') ??
        rootSource;
      const deploymentId =
        custom?.deploymentId ??
        (typeof body.deploymentId === 'string'
          ? body.deploymentId
          : undefined) ??
        url.searchParams.get('deploymentId') ??
        undefined;

      const client = createDeploymentClient({
        rootSource: source,
        rootDeploymentId: deploymentId,
        readDeployment,
      });

      const ctx: DeploymentDiscoveryContext = {
        consumer: null,
        pathname:
          custom?.pathname ??
          (typeof body.pathname === 'string' ? body.pathname : undefined) ??
          url.searchParams.get('pathname') ??
          '/',
        search:
          custom?.search ??
          (typeof body.search === 'string' ? body.search : undefined) ??
          url.searchParams.get('search') ??
          '',
        basename:
          custom?.basename ??
          (typeof body.basename === 'string' ? body.basename : undefined) ??
          url.searchParams.get('basename') ??
          '/',
        mountId:
          custom?.mountId ??
          (typeof body.mountId === 'string' ? body.mountId : undefined) ??
          url.searchParams.get('mountId') ??
          'root',
        signal: request.signal,
      };

      const result = await client.getApplications(ctx);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      });
    } catch (error) {
      const isExpired = Boolean(
        error &&
        typeof error === 'object' &&
        (error as { code?: unknown }).code === SNAPSHOT_EXPIRED_CODE,
      );
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          ...(isExpired ? { code: SNAPSHOT_EXPIRED_CODE } : {}),
        }),
        {
          status: isExpired ? 409 : 400,
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-store',
          },
        },
      );
    }
  };
}
