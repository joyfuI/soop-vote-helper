import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

import type { StoreType } from '../types';

export type StreamerListProps = {
  data: StoreType['streamerIds'];
  onAdd: (value: StoreType['streamerIds'][0]) => void;
  onDelete: (value: StoreType['streamerIds'][0]) => void;
  onConnect: (
    value: StoreType['streamerIds'][0],
  ) => Promise<boolean> | boolean | undefined;
  onDisconnect: (
    value: StoreType['streamerIds'][0],
  ) => Promise<boolean> | boolean | undefined;
};

const StreamerList = ({
  data,
  onAdd,
  onDelete,
  onConnect,
  onDisconnect,
}: StreamerListProps) => {
  const [connectMap, setConnectMap] = useState(new Map<string, boolean>());
  const [value, setValue] = useState('');

  const handleConnect = async (streamerId: string) => {
    if (connectMap.get(streamerId)) {
      if ((await onDisconnect(streamerId)) !== false) {
        setConnectMap((oldConnectMap) => {
          const newConnectMap = new Map(oldConnectMap);
          newConnectMap.set(streamerId, false);
          return newConnectMap;
        });
      }
    } else {
      if ((await onConnect(streamerId)) !== false) {
        setConnectMap((oldConnectMap) => {
          const newConnectMap = new Map(oldConnectMap);
          newConnectMap.set(streamerId, true);
          return newConnectMap;
        });
      }
    }
  };

  const handleDelete = (streamerId: string) => {
    onDelete(streamerId);
    setConnectMap((oldConnectMap) => {
      const newConnectMap = new Map(oldConnectMap);
      newConnectMap.delete(streamerId);
      return newConnectMap;
    });
  };

  return (
    <Paper sx={{ width: 300 }}>
      <List disablePadding>
        {data.map((item) => {
          const isConnected = connectMap.get(item) ?? false;

          return (
            <ListItem key={item}>
              <ListItemText primary={item} />
              <ButtonGroup
                color={isConnected ? 'error' : 'primary'}
                size="small"
                variant="contained"
              >
                <Button onClick={() => handleConnect(item)}>
                  {isConnected ? <StopIcon /> : <PlayArrowIcon />}
                </Button>
                <Button
                  disabled={isConnected}
                  onClick={() => handleDelete(item)}
                  variant="outlined"
                >
                  <ClearIcon />
                </Button>
              </ButtonGroup>
            </ListItem>
          );
        })}
        <Divider />
        <ListItem
          secondaryAction={
            <IconButton edge="end" onClick={() => onAdd(value)}>
              <AddIcon />
            </IconButton>
          }
        >
          <TextField
            fullWidth
            onChange={(e) => setValue(e.target.value)}
            placeholder="SOOP ID"
            value={value}
            variant="standard"
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default StreamerList;
