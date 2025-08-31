import { describe, expect, it } from 'bun:test';
import { app } from '../src';

describe('/download-links', () => {
    it('should return download URLs', async () => {
        const req = new Request('http://localhost/download-links');
        const res = await app.handle(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toHaveProperty('windowsUrl');
        expect(data).toHaveProperty('macUrl');
        expect(data).toHaveProperty('linuxUrl');
        expect(data).toHaveProperty('releasesUrl');
    });
});
