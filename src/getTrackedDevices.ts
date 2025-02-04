import {
  decryptPayload,
  DecryptedPayload,
  getAdvertisementKey,
} from './decryptPayload';

export interface Report {
  datePublished: number;
  description: string;
  id: string;
  payload: string;
  decrypedPayload: DecryptedPayload;
  statusCode: number;
}

export interface Device {
  id: string;
  name: string;
  privateKey: string;
  advertismentKey: string;
  icon: string;
  colorComponents: Array<number>;
}

export async function getDevices(
  devicesDescriptionJSON: string
): Promise<Device[]> {
  const devices = JSON.parse(devicesDescriptionJSON) as Device[];

  await Promise.all(
    devices.map(async (device) => {
      if (device.name === undefined || device.name === '') {
        throw new Error('Device name is missing');
      }
      if (device.privateKey === undefined || device.privateKey === '') {
        throw new Error('Device privateKey is missing');
      }
      device.advertismentKey = await getAdvertisementKey(device.privateKey);
    })
  );

  return devices;
}

export async function getReportsForDevice(
  device: Device,
  apiURL: string,
  username: string,
  password: string,
  days = 7
): Promise<Report[]> {
  const reports = await fetchDevicesReports(
    [device.advertismentKey],
    days,
    apiURL,
    username,
    password
  );

  const reportsWithError: Report[] = [];
  const decryptedReports: Report[] = [];

  const decryptReport = async (report: Report) => {
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
): Promise<Report[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (username !== '' && password !== '') {
    headers.Authorization = 'Basic ' + btoa(`${username}:${password}`);
  }

  const response = await fetch(apiURL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ids: base64AdvertisementKey, days }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json().then((response) => {
    if (!response.statusCode || response.statusCode !== '200') {
      throw new Error('API response was not ok');
    }
    return response.results as Report[];
  });
}
