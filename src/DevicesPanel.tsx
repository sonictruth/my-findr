import { FC } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Icon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { pluralize } from './utils';

interface DevicesPanelProps {
  devices: Device[];
  onDeviceChoosen: (device: Device) => void;
}


const DevicesPanel: FC<DevicesPanelProps> = ({
  devices,
  onDeviceChoosen,
}) => {

  const status = pluralize(devices.length, 'Device');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true
  });

  if (!devices ) {
    return null;
  }

  return (
    <Box
      sx={() => ({
        position: 'absolute',
        top: 10,
        right: 10,
        textAlign: 'center',
        zIndex: 'tooltip',
      })}
    >
      <Accordion  defaultExpanded={isMobile ? false : true}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ pt: 0, pb:0 }}
        >
         {status}
        </AccordionSummary>
        <AccordionDetails  >
          <List
            sx={{
              p: 0,
              m: 0,
              width: '100%',
              maxWidth: 260,
              position: 'relative',
              overflow: 'auto',
              maxHeight: 200,
              '& ul': { padding: 0 },
            }}
            subheader={<li />}
          >
            <li>
              <ul >
                {devices.map((device) => (
                  <ListItem sx={{ p: 0, m:0 }} key={`item-${device.id}`}>
                    <ListItemButton onClick={() => onDeviceChoosen(device)}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Icon
                          sx={{
                            color: device.hexColor,
                          }}
                        >
                         {device.icon}
                        </Icon>
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
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default DevicesPanel;
