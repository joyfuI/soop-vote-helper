import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

import type { StoreType } from '../types';

export type VotingItemListProps = {
  data: StoreType['votingItems'];
  onAdd: (key: string, name: string, color: string) => void;
  onDelete: (key: string) => void;
};

const VotingItemList = ({ data, onAdd, onDelete }: VotingItemListProps) => {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');

  return (
    <Paper sx={{ width: 400 }}>
      <List disablePadding>
        {Object.entries(data).map(
          ([itemKey, { name: itemName, color: itemColor }]) => (
            <ListItem
              key={itemKey}
              secondaryAction={
                <IconButton edge="end" onClick={() => onDelete(itemKey)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${itemKey} / ${itemName}`}
                sx={{ color: itemColor }}
              />
            </ListItem>
          ),
        )}
        <Divider />
        <ListItem
          secondaryAction={
            <IconButton edge="end" onClick={() => onAdd(key, name, color)}>
              <AddIcon />
            </IconButton>
          }
        >
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              label="키"
              onChange={(e) => setKey(e.target.value)}
              value={key}
              variant="standard"
            />
            <TextField
              fullWidth
              label="항목명"
              onChange={(e) => setName(e.target.value)}
              value={name}
              variant="standard"
            />
            <TextField
              label="차트 컬러"
              onChange={(e) => setColor(e.target.value)}
              sx={{ width: '140px' }}
              type="color"
              value={color}
              variant="standard"
            />
          </Stack>
        </ListItem>
      </List>
    </Paper>
  );
};

export default VotingItemList;
