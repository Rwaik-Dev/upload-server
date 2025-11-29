import { Readable } from 'node:stream'
import { z } from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { Either, makeLeft, makeRight } from '@/infra/shared/either'
import { InvalidFileFormat } from '../erros/invalid-file-format'

const uploadImageInput = z.object({
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadImageInput = z.input<typeof uploadImageInput>

const allowedmimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

export async function uploadImage(
  input: UploadImageInput
): Promise<Either<InvalidFileFormat, { url: string }>> {
  const { contentStream, contentType, fileName } = uploadImageInput.parse(input)

  if (!allowedmimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormat())
  }

  //TODO: carregar a imagem para o Cloudflare R2

  await db.insert(schema.uploads).values({
    name: fileName,
    remoteKey: fileName,
    remoteUrl: 'https://example.com',
  })

  return makeRight({ url: '' })
}
