import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { isRight, unwrapEither } from '@/infra/shared/either'
import { makeUpload } from '@/test/factories/make-upload'
import { exportUploads } from './export-uploads'

describe('getUploads', () => {
  it('should be able to export uploads', async () => {
    const namePattern = randomUUID()

    const upload1 = await makeUpload({ name: `${namePattern}.webp` })
    const upload2 = await makeUpload({ name: `${namePattern}.webp` })
    const upload3 = await makeUpload({ name: `${namePattern}.webp` })
    const upload4 = await makeUpload({ name: `${namePattern}.webp` })
    const upload5 = await makeUpload({ name: `${namePattern}.webp` })

    const sut = await exportUploads({
      searchQuery: namePattern,
    })

  })

})
