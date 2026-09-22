import React from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Stack } from '@mui/material';

export default function Login() {
return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9', p: 2 }}>
    <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 4 }}>
        
        <Stack spacing={3}>
            {/* Logo */}
            <Box sx={{ border: '1px solid #ccc', borderRadius: 2, py: 2, textAlign: 'center', mb: 2, bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c59' }}>Logo</Typography>
            </Box>

            {/* Campos de texto */}
            <TextField label="Usuario" variant="outlined" fullWidth size="small" />
            <TextField label="Contraseña" type="password" variant="outlined" fullWidth size="small" />
            <TextField label="Carrera" variant="outlined" fullWidth size="small" />

            {/* Botón de acceso */}
            <Button variant="outlined" fullWidth sx={{ py: 1, mt: 1, color: '#0f2c59', borderColor: '#0f2c59', fontWeight: 'bold', textTransform: 'none' }}>
            Acceder
            </Button>

            {/* Link de recuperación */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Link href="#" underline="hover" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                ¿Olvidó su contraseña?
            </Link>
            </Box>
        </Stack>

        </CardContent>
    </Card>
    </Box>
);
}