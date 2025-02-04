import {
  decryptPayload,
  getAdvertisementKey,
} from './decryptPayload';
import crypto from 'crypto';

const advertisementKey = 'LScsc5XDMXnrhS0Q//n0VRYPM+eHs1+Qzr43dHGHWHQ=';
const privateKey = 'UApQCLNZ1Kovd1hXd8Sc+mhSpsNiTOkkbP+X7Q==';
const payload =
  'LVCxmQADBMtqJADkDZ7qcxWOZzG0ooFeWgdS1Ym9/C4ThYMDF8YEgjkjIxlw0Psi3VWejfHRmLM9Ti3LQvBnqDtQ6GpOclYJxi7J4xqSdx35Rl0Dy4T4n2Q=';

describe('decryptPayload', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: crypto.webcrypto,
    });
  });

  it('getAdvertisementKey should return the advertisment key', async () => {
    const result = await getAdvertisementKey(privateKey);
    expect(result).toBe(advertisementKey);
  });

  it('decryptPayload should decrypt', async () => {
    const result = await decryptPayload(payload, privateKey);
    expect(result).toBeTruthy();
    expect(result.date?.getTime()).toBe(1738570265000);
    expect(result.confidence).toBe(0);
    expect(result.location?.accuracy).toBe(91);
    expect(result.location?.latitude).toBe(41.3777135);
    expect(result.location?.longitude).toBe(2.1752973);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
Object.defineProperty(globalThis, 'crypto', {
  value: crypto.webcrypto,
});
