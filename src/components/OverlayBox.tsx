import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import copyText from '../utils/copyText';

export type OverlayBoxProps = {
  children?: ReactNode;
  path: string;
  width?: number;
  height?: number;
};

const OverlayBox = ({ children, path, width, height }: OverlayBoxProps) => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const url = `${location.origin}/#${path}`;

  return (
    <Box
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      ref={boxRef}
      sx={{
        position: 'relative',
        width: width ?? 'fit-content',
        height: height ?? 'fit-content',
        wordBreak: 'break-all',
      }}
    >
      {children}
      <Backdrop
        open={open}
        sx={{
          position: 'absolute',
          color: 'white',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {boxRef.current?.offsetWidth} x {boxRef.current?.offsetHeight}
        <Box>
          {url}
          <IconButton color="inherit" onClick={() => copyText(url)}>
            <ContentCopyIcon />
          </IconButton>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default OverlayBox;
