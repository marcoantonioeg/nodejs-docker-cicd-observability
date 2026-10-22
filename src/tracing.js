const {NodeSDK} = require('@opentelemetry/sdk-node');
const {getNodeAutoInstrumentations} = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const sdk = new NodeSDK({
   serviceName: 'nodejs-api',
   traceExporter: new OTLPTraceExporter({
      // apunta al contenedor de tempo en la red de docker
      url: 'http://tempo:4318/v1/traces'
   }),
   instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
console.log('Tracing inicializado');