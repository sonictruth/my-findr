import { PageContainer } from '@toolpad/core/PageContainer';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

function MissingSettings() {
  const navigate = useNavigate();
  return (
    <PageContainer breadcrumbs={[]}>
      <Box component='section' sx={{ paddingBottom: 2 }}>
        <p>Please configure the settings to see the map.</p>
        <Stack spacing={2} direction='row'>
          <Button
            variant='contained'
            onClick={() => {
              navigate('/settings');
            }}
          >
            Update Settings
          </Button>
        </Stack>
      </Box>
    </PageContainer>
  );
}

export default MissingSettings;
