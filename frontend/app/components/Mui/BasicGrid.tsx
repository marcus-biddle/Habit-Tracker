import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import type React from 'react';
import { Stack } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'transparent',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
}));

type item = {
    component: React.ReactNode,
    size: number
}

type Props = {
    GridItems: item[]
}

export default function BasicGrid({
    GridItems
}: Props) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Stack spacing={2}>
      <Item>Column 1 - Row 1</Item>
      <Item>Column 1 - Row 2</Item>
      <Item>Column 1 - Row 3</Item>
    </Stack>
        {GridItems.map((item, index) => (
            <Grid size={item.size} key={index}>
                <Item>
                    {item.component}
                </Item>
            </Grid>
        ))}
        
      </Grid>
    </Box>
  );
}
