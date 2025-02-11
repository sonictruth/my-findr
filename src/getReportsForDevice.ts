import {
  decryptPayload,
  getAdvertisementKey,
} from './decryptPayload';


export async function getReportsForDevice(
  device: Device,
  apiURL: string,
  username: string,
  password: string,
  days = 7
): Promise<DeviceReport[]> {

  device.advertismentKey = await getAdvertisementKey(device.privateKey);

  const reports = await fetchDevicesReports(
    [device.advertismentKey],
    days,
    apiURL,
    username,
    password
  );

  const reportsWithError: DeviceReport[] = [];
  const decryptedReports: DeviceReport[] = [];

  const decryptReport = async (report: DeviceReport) => {
    try {
      const decryptedPayload = await decryptPayload(
        report.payload,
        device.privateKey
      );
      report.decrypedPayload = decryptedPayload;
      decryptedReports.push(report);
    } catch (error) {
      console.error('Failed to decrypt payload:', error);
      reportsWithError.push(report);
    }
  };

  const processReports = async () => {
    for (let i = 0; i < reports.length; i++) {
      await decryptReport(reports[i]);
      if (i % 10 === 0) {
        // Yield control back to the browser every 10 reports
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  };

  await processReports();
  const sortedReports = decryptedReports.sort(
    (a, b) =>
      new Date(a.decrypedPayload.date).getTime() -
      new Date(b.decrypedPayload.date).getTime()
  );
  return sortedReports;
}

async function fetchDevicesReports(
  base64AdvertisementKey: string[] = [],
  days: number = 7,
  apiURL: string,
  username: string,
  password: string
): Promise<DeviceReport[]> {


  const isDemo = apiURL.includes('sample.json');
  const isBasicAuth = username !== '' && password !== '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (isBasicAuth) {
    headers.Authorization = 'Basic ' + btoa(`${username}:${password}`);
  }

  const options: RequestInit = {
    method: isDemo ? 'GET' : 'POST',
    headers,
    body: isDemo ? null : JSON.stringify({ ids: base64AdvertisementKey, days }),
  };

  if (isBasicAuth) {
    // options.credentials = 'include';
  }

  const response = await fetch(apiURL, options);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json().then((response) => {
    if (!response.statusCode || response.statusCode !== '200') {
      throw new Error('API response was not ok');
    }
    return response.results as DeviceReport[];
  });
}
