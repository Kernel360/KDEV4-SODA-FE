import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#F59E0B', // 메인 앰버 (로고, 사이드바 액티브 컬러)
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#FBBF24', // 보조 옐로우
      light: '#FDE68A',
      dark: '#F59E0B',
      contrastText: '#ffffff'
    },
    background: {
      default: '#F8FAFC',
      paper: '#ffffff'
    },
    text: {
      primary: '#111827', // 진한 그레이
      secondary: '#374151' // 중간 그레이
    },
    divider: '#E2E8F0',
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#DC2626'
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706'
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669'
    },
    info: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706'
    }
  },
  typography: {
    fontFamily: '"Pretendard", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#111827'
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#111827'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#111827'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#111827'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#111827'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#111827'
    },
    body1: {
      fontSize: '1rem',
      color: '#111827'
    },
    body2: {
      fontSize: '0.875rem',
      color: '#374151'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
          color: '#111827'
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F8FAFC',
          color: '#111827'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow:
            '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow:
            '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none'
        }
      }
    }
  }
})

export default theme
