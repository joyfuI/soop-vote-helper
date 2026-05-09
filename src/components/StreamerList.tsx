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

import type { GetSoopResponse } from '../hooks/useSoopQuery';
import type { StoreType } from '../types';

export type StreamerListProps = {
  data: GetSoopResponse[];
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
  const [value, setValue] = useState('');

  const handleConnect = (streamerId: string) => {
    if (data.find((item) => item.id === streamerId)?.isPlay) {
      onDisconnect(streamerId);
    } else {
      onConnect(streamerId);
    }
  };

  const handleDelete = (streamerId: string) => {
    onDelete(streamerId);
  };

  return (
    <Paper sx={{ width: 300 }}>
      <List disablePadding>
        {data.map((item) => (
          <ListItem key={item.id}>
            <ListItemText primary={item.id} />
            <ButtonGroup
              color={item.isPlay ? 'error' : 'primary'}
              size="small"
              variant="contained"
            >
              <Button onClick={() => handleConnect(item.id)}>
                {item.isPlay ? <StopIcon /> : <PlayArrowIcon />}
              </Button>
              <Button
                disabled={item.isPlay}
                onClick={() => handleDelete(item.id)}
                variant="outlined"
              >
                <ClearIcon />
              </Button>
            </ButtonGroup>
          </ListItem>
        ))}
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
