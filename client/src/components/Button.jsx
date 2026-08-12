import * as React from 'react';
import Button from '@mui/material/Button';

export default function ButtonComponent() {
    return (
        <>
            <Button
                variant="contained"
                className='bg-gradient-to-r from-red-200 to-red-200 '
                sx={{ textTransform: 'none', color: 'darkred' }}
            >
                Click Me
            </Button>
        </>
    )
};