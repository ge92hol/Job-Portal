import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: 'https://fab536cbdba8392ebb5b196df53030a6@o4512086161883136.ingest.de.sentry.io/4512086258679888',

  integrations: [
    nodeProfilingIntegration(),
    Sentry.mongooseIntegration()
  ],

  

  dataCollection: {
  },
})