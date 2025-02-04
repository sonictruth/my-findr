import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router-dom';

function Settings() {
  const params = useParams();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    username: localStorage.getItem('username') || '',
    password: localStorage.getItem('password') || '',
    apiURL: localStorage.getItem('apiURL') || '',
    devicesJSON: localStorage.getItem('devicesJSON') || '',
  });

  const { username, password, apiURL, devicesJSON } = settings;

  const saveSettings = useCallback(() => {
    const trimmedSettings = {
      username: username.trim(),
      password: password.trim(),
      apiURL: apiURL.trim(),
      devicesJSON: devicesJSON.trim(),
    };

    Object.entries(trimmedSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    enqueueSnackbar('Settings saved!', { variant: 'success' });
  }, [username, password, apiURL, devicesJSON, enqueueSnackbar]);

  const clearSettings = useCallback(() => {
    setSettings({
      username: '',
      password: '',
      apiURL: '',
      devicesJSON: '',
    });

    ['username', 'password', 'apiURL', 'devicesJSON'].forEach((key) => {
      localStorage.removeItem(key);
    });

    enqueueSnackbar('Settings cleared!', { variant: 'success' });
  }, [enqueueSnackbar]);

  const shareSettings = useCallback(() => {
    const trimmedSettings = {
      username: username.trim(),
      password: password.trim(),
      apiURL: apiURL.trim(),
      devicesJSON: devicesJSON.trim(),
    };

    const data = `${window.location.href}/${btoa(JSON.stringify(trimmedSettings))}`;
    navigator.clipboard.writeText(data);
    enqueueSnackbar('URL copied to clipboard!', { variant: 'success' });
  }, [username, password, apiURL, devicesJSON, enqueueSnackbar]);

  useEffect(() => {
    if (params.savedSettings) {
      try {
        const newSettings = JSON.parse(atob(params.savedSettings));
        setSettings({
          username: newSettings.username || '',
          password: newSettings.password || '',
          apiURL: newSettings.apiURL || '',
          devicesJSON: newSettings.devicesJSON || '',
        });

        Object.entries(newSettings).forEach(([key, value]) => {
          localStorage.setItem(key, (value as string).trim());
        });

        enqueueSnackbar('Settings loaded from URL!', { variant: 'success' });
        navigate('/map');
      } catch (error) {
        console.error('Failed to load settings from URL:', error);
        enqueueSnackbar('Failed to load settings from URL', {
          variant: 'error',
        });
      }
    }
  }, [enqueueSnackbar, navigate, params.savedSettings]);

  const handleChange = useCallback(
    (key: string) => (event: { target: { value: unknown } }) => {
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: event.target.value,
      }));
    },
    []
  );

  return (
    <PageContainer breadcrumbs={[]}>
      <Box component='section' sx={{ paddingBottom: 2 }}>
        <Stack spacing={2}>
          <TextField
            value={apiURL}
            onChange={handleChange('apiURL')}
            label='API URL'
            variant='outlined'
          />

          <TextField
            value={username}
            onChange={handleChange('username')}
            label='Username'
            variant='outlined'
          />

          <TextField
            value={password}
            onChange={handleChange('password')}
            type='password'
            label='Password'
            variant='outlined'
          />

          <TextField
            value={devicesJSON}
            onChange={handleChange('devicesJSON')}
            multiline
            label='Devices JSON'
            rows={5}
            variant='outlined'
          />
        </Stack>

        <Stack sx={{ paddingTop: 2 }} spacing={2} direction='row'>
          <Button variant='contained' onClick={saveSettings}>
            Save
          </Button>
          <Button variant='outlined' onClick={shareSettings}>
            Share
          </Button>
          <Button variant='outlined' onClick={clearSettings}>
            Clear
          </Button>
        </Stack>
      </Box>
    </PageContainer>
  );
}

export default Settings;
