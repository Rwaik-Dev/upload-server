import { jsonSchemaTransform } from 'fastify-type-provider-zod'

type TransformSwaggerSchemaData = Parameters<typeof jsonSchemaTransform>[0]

export function transformSwaggerSchema(data: TransformSwaggerSchemaData) {
  const { schema, url } = jsonSchemaTransform(data)

  if (schema.consumes?.includes('multipart/form-data')) {
    // Fazemos o narrowing corretamente
    const body = (schema.body ?? {}) as {
      type?: string
      required?: string[]
      properties?: Record<string, unknown>
    }

    if (!body.type) body.type = 'object'
    if (!body.properties) body.properties = {}
    if (!body.required) body.required = []

    body.properties.file = {
      type: 'string',
      format: 'binary'
    }

    body.required.push('file')

    schema.body = body
  }

  return { schema, url }
}
