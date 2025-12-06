/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
         // PRIMARY - Civic Teal (Trust + Sustainability + Growth)
         primary: {
          50:  '#e6f7f5',
          100: '#c4f0eb',
          200: '#96e4dc',
          300: '#64d8cc',
          400: '#3acbbd',
          500: '#1DB6A9',  // 🎯 PERFECT TEAL: Professional + Environmental + Trustworthy
          600: '#189e93',
          700: '#14867d',
          800: '#0f6e67',
          900: '#0a5651',
        },
        
         // SECONDARY - Citrus Amber (Energy + Action + Reward)
        secondary: {
          50:  '#fff8e6',
          100: '#ffedc2',
          200: '#ffe194',
          300: '#ffd462',
          400: '#ffc733',
          500: '#FFB300',  // 🎯 WARM AMBER: Complements teal beautifully
          600: '#E6A100',
          700: '#CC8F00',
          800: '#B37D00',
          900: '#996B00',
        },
        
         // DANGER - Coral Red (Emergency + Attention)
        danger: {
          50:  '#ffebee',
          100: '#ffcdd2',
          200: '#ff9a9a',
          300: '#ff6b6b',
          400: '#ff4444',
          500: '#FF5252',  // Coral red that complements teal
          600: '#E04848',
          700: '#C03E3E',
          800: '#A03434',
          900: '#802A2A',
        },
        
        // WARNING - Amber Gold (Caution + Notification)
        warning: {
          50:  '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#FFC107',  // Gold-amber for warnings
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#FF6F00',
        },
        
        // INFO - Ocean Blue (Municipal Communication)
        info: {
          50:  '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196F3',  // Municipal communication blue
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
        
        // NEUTRAL - Stone Grays (Professional Interface)
        neutral: {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        
        
          // REWARD - Sun Gold (Achievement + Value)
        reward: {
          50:  '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#FFEB3B',
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
        },
        
        // COMMUNITY - Lavender (Inclusion + Collaboration)
        community: {
          50:  '#f3e5f5',
          100: '#e1bee7',
          200: '#ce93d8',
          300: '#ba68c8',
          400: '#ab47bc',
          500: '#9C27B0',
          600: '#8E24AA',
          700: '#7B1FA2',
          800: '#6A1B9A',
          900: '#4A148C',
        },
        
        // ENVIRONMENT - Sage Green (Eco-Friendly Features)
        environment: {
          50:  '#f1f8e9',
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#aed581',
          400: '#9ccc65',
          500: '#8BC34A',  // 🎯 Sage green for environmental features
          600: '#7CB342',
          700: '#689F38',
          800: '#558B2F',
          900: '#33691E',
        }
           },
      
      // 🌟 ANIMATION SYSTEM - Micro-interactions for engagement
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-gentle': 'pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.8s infinite',
        'shake-gentle': 'shakeGentle 0.5s cubic-bezier(.36,.07,.19,.97)',
        'emergency-pulse': 'emergencyPulse 1.5s ease-in-out infinite',
        'reward-glow': 'rewardGlow 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shakeGentle: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-3px)' },
          '40%, 60%': { transform: 'translateX(3px)' },
        },
        emergencyPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)',
            transform: 'scale(1.05)'
          },
        },
        rewardGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          },
        },
      },
      
      // 🌟 TYPOGRAPHY SYSTEM
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        municipal: ['Montserrat', 'Inter', 'sans-serif'],
         heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // 🌟 SHADOW SYSTEM - Depth hierarchy
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'primary': '0 4px 14px 0 rgba(30, 136, 229, 0.3)',
        'secondary': '0 4px 14px 0 rgba(255, 152, 0, 0.3)',
        'danger': '0 4px 14px 0 rgba(244, 67, 54, 0.3)',
        'success': '0 4px 14px 0 rgba(76, 175, 80, 0.3)',
        'reward': '0 4px 20px 0 rgba(255, 215, 0, 0.4)',
        'emergency': '0 0 25px 5px rgba(244, 67, 54, 0.5)',
        'floating': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
      
      // 🌟 BORDER RADIUS SYSTEM
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
        'card': '0.75rem',
        'button': '0.5rem',
        'modal': '1rem',
      },
      
      // 🌟 BACKGROUND GRADIENTS
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
        'gradient-success': 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        'gradient-danger': 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
        'gradient-reward': 'linear-gradient(135deg, #FFD700 0%, #FF9800 100%)',
        'gradient-municipal': 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
        'gradient-card': 'linear-gradient(to bottom right, #FFFFFF 0%, #F5F5F5 100%)',
        'gradient-dark': 'linear-gradient(135deg, #212121 0%, #424242 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      
      // 🌟 SPACING SYSTEM (8pt grid)
      spacing: {
        '0': '0',
        'px': '1px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // 🌟 OPACITY SYSTEM
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '35': '0.35',
        '40': '0.4',
        '45': '0.45',
        '50': '0.5',
        '55': '0.55',
        '60': '0.6',
        '65': '0.65',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
      
      // 🌟 Z-INDEX SYSTEM
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
        'emergency': '9999',
      },
      
      // 🌟 TRANSITION SYSTEM
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'transform': 'transform',
        'all': 'all',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
        'opacity': 'opacity',
        'shadow': 'box-shadow',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'snappy': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
    },
  },
  
  plugins: [],
  
  // 🌟 SAFELIST FOR DYNAMIC CONTENT
}