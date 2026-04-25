import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import PieChartIcon from '@mui/icons-material/PieChart';
import SettingsIcon from '@mui/icons-material/Settings';
import type { BottomNavigationProps } from '@mui/material/BottomNavigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import type { ReactNode } from 'react';
import { Children } from 'react';

export type NavigationProps = {
  children?: ReactNode;
  value?: BottomNavigationProps['value'];
  onChange?: BottomNavigationProps['onChange'];
};

const Navigation = ({ children, value, onChange }: NavigationProps) => {
  return (
    <>
      <Box sx={{ pb: 7 }}>
        {Children.map(children, (child, index) => (
          <div hidden={value !== index} role="tabpanel">
            {child}
          </div>
        ))}
      </Box>

      <Paper
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigation onChange={onChange} showLabels value={value}>
          <BottomNavigationAction icon={<SettingsIcon />} label="설정" />
          <BottomNavigationAction icon={<PieChartIcon />} label="투표" />
          <BottomNavigationAction
            icon={<PictureInPictureIcon />}
            label="오버레이"
          />
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default Navigation;
