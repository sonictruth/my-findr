import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Icon from '@mui/material/Icon';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router-dom';
import { pluralize } from './utils';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getAdvertisementKey } from './decryptPayload';
import { useSettings, defaultSettings } from './useSettings';

const maxFieldLength = 20;

const materialIcons = [
  'location_on',
  'circle',
  'star',
  'filter_vintage',
  'directions_car',
  'directions_bus',
  'face',
  'photo_camera',
  'phone_android',
  'laptop',
  'vpn_key',
  'grass',
  'crib',
  'electric_scooter',
];

const defaultNewDevice: Device = {
  order: 0,
  id: '',
  name: '',
  privateKey: '',
  advertismentKey: '',
  icon: materialIcons[0],
  hexColor: '#00FF00',
};

function Settings() {
  const params = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const [storeSettings, updateStoredSettings, deleteStoredSettings] =
    useSettings();

  const [settingsForm, setSettingsForm] = useState<AppSettings>(
    storeSettings as AppSettings
  );

  const [deviceEditForm, setDeviceEditForm] =
    useState<Device>(defaultNewDevice);

  const validateDevice = useCallback(
    async (device: Device) => {
      if (device.name === '' || device.privateKey === '') {
        enqueueSnackbar('Missing name or private key', { variant: 'error' });
        return false;
      }

      let advertismentKey = '';

      try {
        advertismentKey = await getAdvertisementKey(device.privateKey);
      } catch (error) {
        console.warn('Failed to get advertisment key:', error);
      }

      if (advertismentKey === '') {
        enqueueSnackbar('Check private key', { variant: 'error' });
        return false;
      }

      if (device.name.length > maxFieldLength) {
        enqueueSnackbar(`Name can be maximum ${maxFieldLength} characters`, {
          variant: 'error',
        });
        return false;
      }
      return true;
    },
    [enqueueSnackbar]
  );

  const updateDevice = useCallback(
    async (device: Device) => {
      if (!(await validateDevice(device))) {
        return;
      }
      setSettingsForm((prevSettings) => {
        const updatedDevices = prevSettings.devices.map((d) =>
          d.id === device.id ? device : d
        );
        return {
          ...prevSettings,
          devices: updatedDevices,
        };
      });
      setDeviceEditForm(defaultNewDevice);
      enqueueSnackbar('Device updated !', { variant: 'success' });
    },
    [enqueueSnackbar, validateDevice]
  );

  const addDevice = useCallback(
    async (device: Device) => {
      if (!(await validateDevice(device))) {
        return;
      }

      device.id = uuidv4();

      setSettingsForm({
        ...settingsForm,
        devices: [...settingsForm.devices, device],
      });
      enqueueSnackbar('Device added !', { variant: 'success' });
      setDeviceEditForm(defaultNewDevice);
    },
    [enqueueSnackbar, settingsForm, validateDevice]
  );

  const saveSettings = useCallback(() => {
    if (settingsForm.devices.length === 0) {
      enqueueSnackbar('At least one device is required', { variant: 'error' });
      return;
    }

    if (!settingsForm.apiURL) {
      enqueueSnackbar('API URL cannot be empty', { variant: 'error' });
      return;
    }

    updateStoredSettings(settingsForm);
    enqueueSnackbar('Settings saved!', { variant: 'success' });
  }, [enqueueSnackbar, settingsForm, updateStoredSettings]);

  const clearSettings = useCallback(() => {
    deleteStoredSettings();
    setSettingsForm(defaultSettings);
    enqueueSnackbar('Settings cleared!', { variant: 'success' });
  }, [enqueueSnackbar, deleteStoredSettings, setSettingsForm]);

  const shareSettings = useCallback(() => {
    const base = `${window.location.origin}${window.location.pathname}#/settings/`;
    const data = `${base}${btoa(JSON.stringify(settingsForm))}`;
    navigator.clipboard.writeText(data);
    enqueueSnackbar('URL copied to clipboard!', { variant: 'success' });
  }, [enqueueSnackbar, settingsForm]);

  const removeDevice = useCallback(
    (device: Device) => {
      setSettingsForm((prevSettings) => ({
        ...prevSettings,
        devices: prevSettings.devices.filter((d) => d.id !== device.id),
      }));
      enqueueSnackbar('Device removed!', { variant: 'success' });
    },
    [enqueueSnackbar]
  );

  const editDevice = useCallback(
    (device: Device) => {
      setDeviceEditForm(device);
    },
    [setDeviceEditForm]
  );


  const hasLoadedSettings = useRef(false);

  useEffect(() => {
    if (params.savedSettings && !hasLoadedSettings.current) {
      try {
        const urlSettings = JSON.parse(atob(params.savedSettings));

        updateStoredSettings(urlSettings);
        setSettingsForm(urlSettings);
        navigate('/map');
        hasLoadedSettings.current = true;


        enqueueSnackbar('Settings loaded from URL!', { variant: 'success' });
      } catch (error) {
        console.error('Failed to load settings from URL:', error);
        enqueueSnackbar('Failed to load settings from URL', {
          variant: 'error',
        });
      }
    }
  }, [enqueueSnackbar, params.savedSettings, updateStoredSettings]);

  return (
    <PageContainer breadcrumbs={[]}>
      <Box component='section' sx={{ paddingBottom: 2 }}>
        <Stack spacing={2} maxWidth={500}>
          <TextField
            value={settingsForm.apiURL}
            label='API URL'
            variant='outlined'
            onChange={(e) =>
              setSettingsForm({ ...settingsForm, apiURL: e.target.value })
            }
          />
          <TextField
            value={settingsForm.username}
            label='Username'
            variant='outlined'
            onChange={(e) =>
              setSettingsForm({ ...settingsForm, username: e.target.value })
            }
          />
          <TextField
            value={settingsForm.password}
            type='password'
            label='Password'
            variant='outlined'
            onChange={(e) =>
              setSettingsForm({ ...settingsForm, password: e.target.value })
            }
          />
          <FormControl>
            <FormLabel>History Length</FormLabel>
            <Slider
              valueLabelFormat={(value: number) => pluralize(value, 'Day')}
              defaultValue={1}
              value={settingsForm.days}
              step={1}
              marks
              valueLabelDisplay='auto'
              min={1}
              max={7}
              onChange={(_e, value) =>
                setSettingsForm({ ...settingsForm, days: value as number })
              }
            />
          </FormControl>

          <Box>
            <Typography gutterBottom>
              {settingsForm.devices.length ? (
                <>Devices:</>
              ) : (
                <>No devices yet</>
              )}
            </Typography>
            {settingsForm.devices.map((device) => (
              <Box
                key={device.id}
                sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
              >
                <Icon sx={{ mr: 1, color: device.hexColor }}>
                  {device.icon}
                </Icon>
                <Box sx={{ flexGrow: 1 }}>
                  <Box>{device.name}</Box>
                </Box>

                <Button
                  sx={{ mr: 1 }}
                  variant='outlined'
                  onClick={() => editDevice(device)}
                >
                  Edit
                </Button>

                <Button
                  variant='outlined'
                  color='error'
                  onClick={() => removeDevice(device)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>

          <Paper
            sx={{
              padding: 2,
            }}
          >
            <Stack spacing={2} direction='column'>
              <Stack spacing={2} direction='row'>
                <TextField
                  fullWidth={true}
                  type='text'
                  value={deviceEditForm.name}
                  onChange={(e) =>
                    setDeviceEditForm({
                      ...deviceEditForm,
                      name: e.target.value,
                    })
                  }
                  label='Name'
                  variant='outlined'
                />
                <TextField
                  fullWidth={true}
                  type='color'
                  value={deviceEditForm.hexColor}
                  onChange={(e) =>
                    setDeviceEditForm({
                      ...deviceEditForm,
                      hexColor: e.target.value,
                    })
                  }
                  label='Color'
                  variant='outlined'
                />
              </Stack>

              <TextField
                type='password'
                value={deviceEditForm.privateKey}
                onChange={(e) =>
                  setDeviceEditForm({
                    ...deviceEditForm,
                    privateKey: e.target.value,
                  })
                }
                label='Bae64 Private Key'
                variant='outlined'
              />

              <FormControl>
                <FormLabel>Icon</FormLabel>
                <RadioGroup
                  value={deviceEditForm.icon}
                  onChange={(e) =>
                    setDeviceEditForm({
                      ...deviceEditForm,
                      icon: e.target.value,
                    })
                  }
                  row
                >
                  {materialIcons.map((icon) => (
                    <FormControlLabel
                      key={icon}
                      value={icon}
                      control={<Radio />}
                      label={<Icon>{icon}</Icon>}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <Button
                variant='outlined'
                onClick={
                  deviceEditForm.id
                    ? () => updateDevice(deviceEditForm)
                    : () => addDevice(deviceEditForm)
                }
                startIcon={<AddCircleIcon />}
              >
                {deviceEditForm.id ? 'Update' : 'Add'}
              </Button>
            </Stack>
          </Paper>

          <Stack sx={{ paddingTop: 2 }} spacing={2} direction='row'>
            <Button fullWidth={true} variant='contained' onClick={saveSettings}>
              Save
            </Button>
            <Button
              fullWidth={true}
              variant='outlined'
              onClick={clearSettings}
              color='error'
            >
              Clear
            </Button>

            <Button fullWidth={true} variant='outlined' onClick={shareSettings}>
              Share
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContainer>
  );
}

export default Settings;
