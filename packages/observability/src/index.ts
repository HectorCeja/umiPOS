import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { SpanStatusCode, trace } from '@opentelemetry/api';

export interface TelemetryOptions {
  readonly enabled: boolean;
  readonly endpoint: string;
  readonly serviceName: string;
  readonly serviceVersion: string;
}

export interface TelemetryLifecycle {
  shutdown(): Promise<void>;
}

export function startTelemetry(options: TelemetryOptions): TelemetryLifecycle {
  if (!options.enabled) {
    return { shutdown: () => Promise.resolve() };
  }

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: options.serviceName,
      [ATTR_SERVICE_VERSION]: options.serviceVersion,
    }),
    traceExporter: new OTLPTraceExporter({ url: `${options.endpoint}/v1/traces` }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();
  return { shutdown: () => sdk.shutdown() };
}

export async function traceOperation<T>(
  name: string,
  attributes: Readonly<Record<string, string | number | boolean>>,
  operation: () => Promise<T>,
): Promise<T> {
  return trace.getTracer('nexo.application').startActiveSpan(name, async (span) => {
    span.setAttributes(attributes);
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error('Unknown operation error'));
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}
