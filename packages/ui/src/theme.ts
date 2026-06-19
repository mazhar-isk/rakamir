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
    fontFamily: '"Playfair Display", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
    primary: {
      main: '#D26B54',
      light: '#EBC4B8',
      dark: '#B5533E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EBC4B8',
      light: '#F5DFD7',
      dark: '#CBA094',
      contrastText: '#1A1A2E',
    },
    background: {
      default: '#F9F6F2',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E2A27',
      secondary: '#7B6E66',
    },
  },
  components: {
    ...baseTheme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          letterSpacing: '0.02em',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          backgroundColor: '#D26B54',
          color: '#ffffff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#B5533E',
            boxShadow: '0 4px 12px rgba(210,107,84,0.2)',
          },
        },
        containedSecondary: {
          backgroundColor: '#F5DFD7',
          color: '#7B5E57',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#EBC4B8',
            boxShadow: '0 4px 12px rgba(235,196,184,0.3)',
          },
        },
        outlinedPrimary: {
          borderColor: '#D26B54',
          color: '#D26B54',
          '&:hover': {
            borderColor: '#B5533E',
            backgroundColor: 'rgba(210, 107, 84, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 30px rgba(110, 98, 92, 0.04)',
          border: '1px solid rgba(235, 196, 184, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(210, 107, 84, 0.15)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D26B54',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D26B54',
            borderWidth: '2px',
          },
        },
      },
    },
  },
});

export const backofficeTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
    primary: {
      main: '#D26B54',
      light: '#EBC4B8',
      dark: '#B5533E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EBC4B8',
      light: '#F5DFD7',
      dark: '#CBA094',
      contrastText: '#1A1A2E',
    },
    background: {
      default: '#F9F6F2',
      paper: '#FFFFFF',
    },
  },
  components: {
    ...baseTheme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          backgroundColor: '#D26B54',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(210,107,84,0.15)',
          '&:hover': {
            backgroundColor: '#B5533E',
            boxShadow: '0 4px 12px rgba(210,107,84,0.3)',
          },
        },
        outlinedSecondary: {
          borderColor: '#EBC4B8',
          color: '#D26B54',
          backgroundColor: 'transparent',
          '&:hover': {
            borderColor: '#D26B54',
            backgroundColor: 'rgba(235, 196, 184, 0.15)',
          },
        },
        outlinedPrimary: {
          borderColor: '#EBC4B8',
          color: '#D26B54',
          backgroundColor: 'transparent',
          '&:hover': {
            borderColor: '#D26B54',
            backgroundColor: 'rgba(210, 107, 84, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(210,107,84,0.04)',
          border: '1px solid rgba(235, 196, 184, 0.2)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(210, 107, 84, 0.2)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D26B54',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D26B54',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(235, 196, 184, 0.3)',
        },
        indicator: {
          backgroundColor: '#D26B54',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
          color: 'rgba(110, 98, 92, 0.7)',
          '&.Mui-selected': {
            color: '#D26B54',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
    MuiDataGrid: {
      defaultProps: {
        localeText: {
          noRowsLabel: 'Belum ada data',
        },
      },
      styleOverrides: {
        root: {
          border: 'none',
          backgroundColor: '#FFFFFF',
          '& .MuiDataGrid-cell': {
            borderColor: 'rgba(235, 196, 184, 0.2)',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderColor: 'rgba(235, 196, 184, 0.3)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderColor: 'rgba(235, 196, 184, 0.2)',
          },
        },
        columnHeader: {
          backgroundColor: '#FDF5F2',
        },
        columnHeaderTitle: {
          backgroundColor: '#FDF5F2',
          fontWeight: 700,
          color: '#5C4E4B',
          '&:focus, &:focus-within': { outline: 'none' },
        },
        row: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#FFFFFF',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#FDF9F7',
          },
          '&:hover': {
            backgroundColor: '#F7EDE9 !important',
          },
        },
      },
    },
  },
});

export default storefrontTheme;
