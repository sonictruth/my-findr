import './Map.css';
import 'leaflet/dist/leaflet.css';
import { mapIcon } from './mapIcon';

import { useCallback, useEffect, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

import {
  Device,
  getDevices,
  getReportsForDevice,
  Report,
} from './getTrackedDevices';
import MissingSettings from './MissingSettings';
import { Slider, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import Loading from './Loading';
import DevicesPanel from './DevicesPanel';
import { getHTMLColorFromArray, pluralize, timeSince } from './utils';

const defaultMapZoom = 14;

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.flyTo(center);
  return null;
}

function Map() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isDarkTheme = theme.palette.mode === 'dark';
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([
    51.505, -0.09,
  ]);

  const [filterRange, setFilterRange] = useState<number[]>([0, 0]);

  const [devices, setDevices] = useState<Device[]>([]);

  const [currentDevice, setCurrentDevice] = useState<Device>();

  const [reports, setReports] = useState<Report[]>([]);

  const [filteredReports, setFilteredReports] = useState<Report[]>([]);

  const [polyline, setPolyline] = useState<[number, number][]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const username = localStorage.getItem('username') || '';
  const password = localStorage.getItem('password') || '';
  const devicesJSON = localStorage.getItem('devicesJSON') || '';
  const apiURL = localStorage.getItem('apiURL') || '';

  const isMissingRequredSettings = devicesJSON === '' || apiURL === '';

  const init = useCallback(async () => {
    try {
      const devices = await getDevices(devicesJSON);
      setDevices(devices);
      console.log('Devices:', devices);
      const numberOfDevices = pluralize(devices.length, 'device');
      enqueueSnackbar(`Found ${numberOfDevices} configured`);
    } catch (error) {
      enqueueSnackbar('Error getting devices, check JSON !', {
        variant: 'error',
      });
      console.error('Failed to fetch data:', error);
    }
  }, [devicesJSON, enqueueSnackbar]);

  const onDeviceChoosen = async (device: Device) => {
    setIsLoading(true);

    try {
      const newReports = await getReportsForDevice(
        device,
        apiURL,
        username,
        password
      );

      if (newReports.length === 0) {
        throw new Error('No reports found');
      }

      setReports(newReports);
      setCurrentDevice(device);

      setFilterRange([1, newReports.length]);

      const numberOfReports = pluralize(newReports.length, 'Report');
      enqueueSnackbar(`${numberOfReports} loaded`, { variant: 'success' });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      enqueueSnackbar('Error getting device reports', {
        variant: 'error',
      });
    }
    setIsLoading(false);
  };

  const filterReports = useCallback(() => {
    if (reports.length > 0) {
      const newFilteredReports = reports.slice(
        filterRange[0] - 1,
        filterRange[1] - 1
      );

      if (newFilteredReports.length === 0) {
        return;
      }

      const devicePolyline: [number, number][] = newFilteredReports.map(
        (report) => [
          report.decrypedPayload.location.latitude,
          report.decrypedPayload.location.longitude,
        ]
      );

      const lastReport = newFilteredReports[newFilteredReports.length - 1];
      const lastLocation = lastReport.decrypedPayload.location;
      setCurrentPosition([lastLocation.latitude, lastLocation.longitude]);
      setPolyline(devicePolyline);
      setFilteredReports(newFilteredReports);
    } else {
      setFilteredReports([]);
      setPolyline([]);
    }
  }, [filterRange, reports]);

  useEffect(() => {
    filterReports();
  }, [reports, filterRange, filterReports]);

  useEffect(() => {
    if (!isMissingRequredSettings) {
      init();
    }
  }, [isMissingRequredSettings, init]);

  const handleFilterChanged = (_event: unknown, newValue: number | number[]) =>
    setFilterRange(Array.isArray(newValue) ? newValue : [newValue, newValue]);

  const getSliderLabel = (reportIndex: number) =>
    `${reports[reportIndex - 1].decrypedPayload.date.toLocaleTimeString()} 
  ${reports[reportIndex - 1].decrypedPayload.date.toLocaleDateString()}
  `;

  return (
    <>
      {isMissingRequredSettings ? (
        <MissingSettings />
      ) : (
        <div
          className={isDarkTheme ? 'darkMap' : ''}
          style={{ height: '100%', position: 'relative', overflow: 'hidden' }}
        >
          <Loading isLoading={isLoading} />
          <DevicesPanel devices={devices} onDeviceChoosen={onDeviceChoosen} />
          {reports.length > 1 && (
            <Slider
              sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                width: 'calc(100% - 50px)',
                zIndex: 1000,
              }}
              onChange={handleFilterChanged}
              valueLabelFormat={getSliderLabel}
              value={filterRange}
              max={reports.length}
              min={1}
              valueLabelDisplay='auto'
              disableSwap
            />
          )}
          <MapContainer center={currentPosition} zoom={defaultMapZoom}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            {filteredReports.map((report, reportIndex) => {
              const color = getHTMLColorFromArray(
                currentDevice?.colorComponents
              );
              const isLastReport = reportIndex === filteredReports.length - 1;
              const payload = report.decrypedPayload;
              const location = payload.location;
              const minAccuracy = 30;
              const radius = Math.min(
                location.accuracy > 1 ? location.accuracy / 11 : minAccuracy,
                minAccuracy
              );

              return isLastReport ? (
                <Marker
                  icon={mapIcon}
                  interactive={true}
                  key={'last-report-' + reportIndex}
                  position={[location.latitude, location.longitude]}
                >
                  <Tooltip>
                    {currentDevice?.name} <br />
                    Last seen: {timeSince(payload.date)} ago
                    <br />
                    Date: {payload.date.toLocaleDateString()} <br />
                    Time: {payload.date.toLocaleTimeString()} <br />
                    Accuracy: {location.accuracy}
                  </Tooltip>
                </Marker>
              ) : (
                <CircleMarker
                  key={'raport-' + reportIndex}
                  center={[location.latitude, location.longitude]}
                  pathOptions={{ color, stroke: true, weight: 1 }}
                  radius={radius}
                >
                  <Tooltip>
                    {currentDevice?.name} <br />
                    Date: {payload.date.toLocaleDateString()} <br />
                    Time: {payload.date.toLocaleTimeString()} <br />
                    Accuracy: {location.accuracy}
                  </Tooltip>
                </CircleMarker>
              );
            })}

            <Polyline
              pathOptions={{
                stroke: true,
                dashArray: '5, 5',
                dashOffset: '5',
                weight: 1,
                color: getHTMLColorFromArray(currentDevice?.colorComponents),
              }}
              positions={polyline}
            />
            <ChangeView center={currentPosition} />
          </MapContainer>
        </div>
      )}
    </>
  );
}

export default Map;
