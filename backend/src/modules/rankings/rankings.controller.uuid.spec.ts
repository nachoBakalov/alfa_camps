import { ArgumentMetadata, ParseUUIDPipe } from '@nestjs/common';

describe('RankingsController UUID validation', () => {
  it('rejects invalid campId for ranking route params', async () => {
    const pipe = new ParseUUIDPipe();
    const metadata: ArgumentMetadata = { type: 'param', metatype: String, data: 'campId' };

    await expect(pipe.transform('not-a-uuid', metadata)).rejects.toThrow();
  });
});
