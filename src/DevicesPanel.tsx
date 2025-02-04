import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PlaceTwoToneIcon from '@mui/icons-material/PlaceTwoTone';
import { Device } from './getTrackedDevices';
import { getHTMLColorFromArray, pluralize } from './utils';

interface DevicesPanelProps {
  devices: Device[];
  onDeviceChoosen: (device: Device) => void;
}

const fontSize = 10;

const DevicesPanel: React.FC<DevicesPanelProps> = ({
  devices,
  onDeviceChoosen,
}) => {
  if (!devices) {
    return null;
  }

  const status = pluralize(devices.length, 'Device');

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        p: 1,
        borderColor: theme.palette.divider,
        borderStyle: 'solid',
        position: 'absolute',
        top: 10,
        right: 10,
        textAlign: 'center',
        zIndex: 'tooltip',
      })}
    >
      <Box sx={{ p: 1, fontSize }}>{status}</Box>

      <List
        sx={{
          width: '100%',
          maxWidth: 260,
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'auto',
          maxHeight: 200,
          '& ul': { padding: 0 },
        }}
        subheader={<li />}
      >
        <li>
          <ul>
            {devices.map((device) => (
              <ListItem sx={{ p: 0 }} key={`item-${device.id}`}>
                <ListItemButton onClick={() => onDeviceChoosen(device)}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <PlaceTwoToneIcon
                      sx={{
                        color: getHTMLColorFromArray(device.colorComponents),
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={`item-text-${device.id}`}
                    primary={`${device.name}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </ul>
        </li>
      </List>
    </Box>
  );
};

export default DevicesPanel;
