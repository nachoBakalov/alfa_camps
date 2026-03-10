import { ArgumentMetadata, ParseUUIDPipe } from '@nestjs/common';

describe('PhotosController UUID validation', () => {
  it('rejects invalid playerId for photos route params', async () => {
    const pipe = new ParseUUIDPipe();
    const metadata: ArgumentMetadata = { type: 'param', metatype: String, data: 'playerId' };

    await expect(pipe.transform('not-a-uuid', metadata)).rejects.toThrow();
  });
});
