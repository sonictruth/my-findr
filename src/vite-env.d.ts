/// <reference types="vite/client" />

type DeviceReport = {
  datePublished: number;
  description: string;
  id: string;
  payload: string;
  decrypedPayload: DecryptedPayload;
  statusCode: number;
};

type Device = {
  id: string;
  order: number;
  name: string;
  privateKey: string;
  advertismentKey: string;
  icon: string;
  hexColor: string;
};

type AppSettings = {
  username: string;
  password: string;
  apiURL: string;
  devices: Device[];
  days: number;
};

type DecryptedPayload = {
  date: Date;
  confidence: number;
  location: DeviceLocation;
};

type DeviceLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};
