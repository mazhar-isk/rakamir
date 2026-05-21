import { createTheme, ThemeOptions } from '@mui/material/styles';
import type { } from '@mui/x-data-grid/themeAugmentation';

const baseTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#6C63FF',
      light: '#9D97FF',
      dark: '#4A42CC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6584',
      light: '#FF8FA3',
      dark: '#CC4D66',
      contrastText: '#ffffff',
    },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    background: {
      default: '#F8F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 16px rgba(108, 99, 255, 0.3)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 10 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
};

export const storefrontTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
  },
});

export const backofficeTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
    background: {
      default: '#F1F5F9',
      paper: '#FFFFFF',
    },
  },
  components: {
    ...baseTheme.components,
    MuiDataGrid: {
      defaultProps: {
        localeText: {
          noRowsLabel: 'Belum ada data',
        },
      },
      styleOverrides: {
        columnHeader: {
          backgroundColor: '#EBC4B8',
        },
        columnHeaderTitle: {
          backgroundColor: '#EBC4B8',
          '&:focus, &:focus-within': { outline: 'none' },
        },
        row: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#FFFFFF',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#FDF5F2',
          },
          '&:hover': {
            backgroundColor: '#F5E6E2 !important',
          },
        },
      },
    },
  },
});

export default storefrontTheme;
