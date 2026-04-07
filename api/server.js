import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true
})

await fastify.register(cors, {
  origin: true // Enable CORS for development
})

// Basic route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// Example API endpoint
fastify.get('/api/status', async function handler (request, reply) {
  return { status: 'ok', service: 'fastify-api' }
})

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080')
    const host = process.env.HOST || '0.0.0.0'
    await fastify.listen({ port, host })
    fastify.log.info(`server listening on ${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
