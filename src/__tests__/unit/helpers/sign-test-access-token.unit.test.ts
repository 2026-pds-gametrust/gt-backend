import jwt from 'jsonwebtoken';
import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../helpers/sign-test-access-token';

describe('when signing a test access token', () => {
  it('should include sub groups sid fid and typ=access', () => {
    const token = signTestAccessToken({
      actorId: 'carlos-id',
      groups: [EUserGroup.APP_USER],
    });
    const payload = jwt.decode(token) as jwt.JwtPayload;

    expect(payload.sub).toBe('carlos-id');
    expect(payload.groups).toEqual([EUserGroup.APP_USER]);
    expect(typeof payload.sid).toBe('string');
    expect(typeof payload.fid).toBe('string');
    expect(payload.typ).toBe('access');
  });
});
