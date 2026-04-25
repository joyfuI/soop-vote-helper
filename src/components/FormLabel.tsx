import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type FormLabelProps = {
  children?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
};

const FormLabel = ({ children, label, description }: FormLabelProps) => {
  return (
    <Box>
      <Typography gutterBottom variant="h6">
        {label}
      </Typography>
      {description ? (
        <Typography gutterBottom sx={{ display: 'block' }} variant="caption">
          {description}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
};

export default FormLabel;
