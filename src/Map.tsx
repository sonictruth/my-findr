import './Map.css';
import 'leaflet/dist/leaflet.css';
import { mapIcon } from './mapIcon';
import DownloadIcon from '@mui/icons-material/Download';
import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { getReportsForDevice } from './getReportsForDevice';
import MissingSettings from './MissingSettings';
import { Tooltip as MuiTooltip, Fab, Slider, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import Loading from './Loading';
import DevicesPanel from './DevicesPanel';
import { pluralize, timeSince } from './utils';
import { useSettings } from './useSettings';
import { LatLngTuple } from 'leaflet';
import { exportKML } from './exportKML';

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

  const [currentDevice, setCurrentDevice] = useState<Device>();

  const [reports, setReports] = useState<DeviceReport[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [settings] = useSettings();

  const isMissingRequredSettings = useMemo(
    () => settings.apiURL === '' || settings.devices.length === 0,
    [settings.apiURL, settings.devices.length]
  );

  const memoizedDevices = useMemo(() => settings.devices, [settings.devices]);

  const onDeviceChoosen = useCallback(
    async (device: Device) => {
      setIsLoading(true);
      try {
        const newReports = await getReportsForDevice(
          device,
          settings.apiURL,
          settings.username,
          settings.password,
          settings.days
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
        enqueueSnackbar((error as Error).message || 'Error', {
          variant: 'error',
        });
      }
      setIsLoading(false);
    },
    [
      enqueueSnackbar,
      settings.apiURL,
      settings.username,
      settings.password,
      settings.days,
    ]
  );

  const filteredReports = useMemo(() => {
    if (reports.length > 0) {
      return reports.slice(filterRange[0] - 1, filterRange[1] - 1);
    }
    return [];
  }, [filterRange, reports]);

  const polyline = useMemo<LatLngTuple[]>(() => {
    return filteredReports.map(
      (report) =>
        [
          report.decrypedPayload.location.latitude,
          report.decrypedPayload.location.longitude,
        ] as LatLngTuple
    );
  }, [filteredReports]);

  useEffect(() => {
    if (filteredReports.length > 0) {
      const lastReport = filteredReports[filteredReports.length - 1];
      const lastLocation = lastReport.decrypedPayload.location;
      setCurrentPosition([lastLocation.latitude, lastLocation.longitude]);
    }
  }, [filteredReports]);

  useEffect(() => {
    if (!isMissingRequredSettings) {
      console.log('Devices:', memoizedDevices);
    }
  }, [memoizedDevices, isMissingRequredSettings, enqueueSnackbar]);

  const handleFilterChanged = useCallback(
    (_event: unknown, newValue: number | number[]) =>
      setFilterRange(Array.isArray(newValue) ? newValue : [newValue, newValue]),
    []
  );

  const getSliderLabel = useCallback(
    (reportIndex: number) =>
      `${reports[reportIndex - 1].decrypedPayload.date.toLocaleTimeString()} 
  ${reports[reportIndex - 1].decrypedPayload.date.toLocaleDateString()}
  `,
    [reports]
  );

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
          <DevicesPanel
            devices={memoizedDevices}
            onDeviceChoosen={onDeviceChoosen}
          />
          {reports.length > 1 && (
            <>
              <Fab
                size='small'
                sx={{
                  zIndex: 999,
                  position: 'absolute',
                  bottom: 80,
                  right: 20,
                }}
                color='primary'
                onClick={() => exportKML(filteredReports)}
              >
                <MuiTooltip placement='top' title='Export KML'>
                  <DownloadIcon />
                </MuiTooltip>
              </Fab>

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
            </>
          )}
          <MapContainer center={currentPosition} zoom={defaultMapZoom}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            {filteredReports.map((report, reportIndex) => {
              const color = currentDevice?.hexColor;
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
                    Last seen {timeSince(payload.date)} ago <br />
                    Date:
                    {payload.date.toLocaleDateString()} <br />
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
                color: currentDevice?.hexColor,
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
