import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface ReusableModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
}

export default function ReusableModal({
  open,
  title,
  onClose,
  onConfirm,
  confirmLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  children,
}: ReusableModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ style: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#0f172a', pb: 1, borderBottom: '1px solid #e2e8f0' }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', pb: '16px' }}>{children}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
          {cancelLabel}
        </Button>
        {onConfirm && (
          <Button variant="contained" onClick={onConfirm} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, backgroundColor: '#008E60', '&:hover': { backgroundColor: '#007650' } }}>
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
