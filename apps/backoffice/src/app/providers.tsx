'use client';

import { ReactNode, useState } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { useServerInsertedHTML } from 'next/navigation';
import { backofficeTheme } from '@ecommerce/ui';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';
import { TableSkeletonLoadingOverlay, TableNoRowsOverlay } from '@/components/common/DataGridOverlays';

const customTheme = createTheme(backofficeTheme, {
  components: {
    MuiDataGrid: {
      defaultProps: {
        slots: {
          loadingOverlay: TableSkeletonLoadingOverlay,
          noRowsOverlay: TableNoRowsOverlay,
        },
      },
    },
  },
});

function ThemeRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'bo-mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) inserted.push(serialized.name);
      return prevInsert(...args);
    };
    const flush = () => { const p = inserted; inserted = []; return p; };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;
    let styles = '';
    for (const name of names) styles += cache.inserted[name];
    return <style key={cache.key} data-emotion={`${cache.key} ${names.join(' ')}`} dangerouslySetInnerHTML={{ __html: styles }} />;
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

export default function BackofficeProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeRegistry>
      <ThemeProvider theme={customTheme}>
        <CssBaseline />
        <AdminAuthProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </AdminAuthProvider>
      </ThemeProvider>
    </ThemeRegistry>
  );
}
