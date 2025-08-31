import {describe, expect, it} from 'bun:test';
import {app} from '../src';

describe('Root Route', () => {
    it('should return welcome message', async () => {
        const req = new Request('http://localhost/');
        const res = await app.handle(req);
        const data = await res.text();

        expect(res.status).toBe(200);
        expect(data).toEqual('Welcome to the APL server!');
    });
});
