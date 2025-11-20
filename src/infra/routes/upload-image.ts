import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const uploadImageRoute: FastifyPluginAsyncZod = async (
  server
) => {
  server.post('/uploads',{
    schema:{
        summary: "Upload an image"
    }
  } , async () => {
    return 'Hello World'
  })
}
