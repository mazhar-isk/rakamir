'use client';

import { ErrorOutline, HelpOutline, InfoOutlined, WarningAmberRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// ─── Variant config ───────────────────────────────────────────────────────────
const VARIANT_CONFIG: Record<ConfirmVariant, { icon: React.ReactNode; color: string; btnColor: 'error' | 'warning' | 'primary' }> = {
  danger: {
    icon: <ErrorOutline sx={{ fontSize: 40 }} />,
    color: '#EF4444',
    btnColor: 'error',
  },
  warning: {
    icon: <WarningAmberRounded sx={{ fontSize: 40 }} />,
    color: '#F59E0B',
    btnColor: 'warning',
  },
  info: {
    icon: <InfoOutlined sx={{ fontSize: 40 }} />,
    color: '#3B82F6',
    btnColor: 'primary',
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  // Store resolve function so we can resolve the promise on user action
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  const v = VARIANT_CONFIG[options.variant ?? 'danger'];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: v.color, display: 'flex', alignItems: 'center' }}>
              {v.icon}
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {options.title ?? (options.variant === 'danger' ? 'Konfirmasi Hapus' : 'Konfirmasi')}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: '8px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {options.message}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => handleClose(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            {options.cancelLabel ?? 'Batal'}
          </Button>
          <Button
            onClick={() => handleClose(true)}
            variant="contained"
            color={v.btnColor}
            sx={{ borderRadius: 2 }}
            autoFocus
          >
            {options.confirmLabel ?? 'Ya, Lanjutkan'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}
