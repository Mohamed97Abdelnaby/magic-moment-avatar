import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotateZ(0deg)' },
					'25%': { transform: 'translateY(-5px) rotateZ(1deg)' },
					'50%': { transform: 'translateY(-10px) rotateZ(0deg)' },
					'75%': { transform: 'translateY(-5px) rotateZ(-1deg)' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(30px) scale(0.9)' },
					to: { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'fade-in-up': {
					from: { opacity: '0', transform: 'translateY(40px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.8) rotateZ(-10deg)' },
					to: { opacity: '1', transform: 'scale(1) rotateZ(0deg)' }
				},
				'bounce-in': {
					'0%': { opacity: '0', transform: 'scale(0.3) translateY(-50px)' },
					'50%': { opacity: '1', transform: 'scale(1.1) translateY(-10px)' },
					'70%': { transform: 'scale(0.9) translateY(0)' },
					'100%': { transform: 'scale(1) translateY(0)' }
				},
				'pulse-soft': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.05)', opacity: '0.9' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						transform: 'scale(1)', 
						boxShadow: '0 0 20px hsl(var(--primary) / 0.4)'
					},
					'50%': { 
						transform: 'scale(1.02)', 
						boxShadow: '0 0 40px hsl(var(--primary) / 0.8), 0 0 60px hsl(var(--primary) / 0.4)'
					}
				},
				'rotate-3d': {
					'0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
					'100%': { transform: 'rotateY(360deg) rotateX(360deg)' }
				},
				'flip-3d': {
					'0%': { transform: 'perspective(1000px) rotateY(0deg)' },
					'50%': { transform: 'perspective(1000px) rotateY(-90deg) scale(1.1)' },
					'100%': { transform: 'perspective(1000px) rotateY(0deg)' }
				},
				'countdown-pulse': {
					'0%': { 
						transform: 'scale(1) rotateZ(0deg)', 
						opacity: '1',
						filter: 'hue-rotate(0deg)'
					},
					'50%': { 
						transform: 'scale(1.2) rotateZ(180deg)', 
						opacity: '0.8',
						filter: 'hue-rotate(180deg)'
					},
					'100%': { 
						transform: 'scale(1) rotateZ(360deg)', 
						opacity: '1',
						filter: 'hue-rotate(0deg)'
					}
				},
				'neural-pulse': {
					'0%, 100%': { 
						transform: 'scale(1) rotate(0deg)',
						filter: 'hue-rotate(0deg) brightness(1)'
					},
					'33%': { 
						transform: 'scale(1.1) rotate(120deg)',
						filter: 'hue-rotate(120deg) brightness(1.2)'
					},
					'66%': { 
						transform: 'scale(0.9) rotate(240deg)',
						filter: 'hue-rotate(240deg) brightness(1.1)'
					}
				},
				'confetti-fall': {
					'0%': { 
						transform: 'translateY(-100vh) rotateZ(0deg) scale(1)',
						opacity: '1'
					},
					'100%': { 
						transform: 'translateY(100vh) rotateZ(720deg) scale(0.5)',
						opacity: '0'
					}
				},
				'camera-focus': {
					'0%, 100%': { 
						transform: 'scale(1)',
						boxShadow: '0 0 0 0px hsl(var(--accent) / 0.7)'
					},
					'50%': { 
						transform: 'scale(1.02)',
						boxShadow: '0 0 0 20px hsl(var(--accent) / 0)'
					}
				},
				'breathe': {
					'0%, 100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
					'50%': { transform: 'scale(1.02) translateY(-2px)', opacity: '0.95' }
				},
				'watercolor-bloom': {
					'0%': { transform: 'scale(0.8)', opacity: '0', filter: 'blur(2px)' },
					'50%': { transform: 'scale(1.1)', opacity: '0.7', filter: 'blur(1px)' },
					'100%': { transform: 'scale(1)', opacity: '1', filter: 'blur(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'scale-in': 'scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'bounce-in': 'bounce-in 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'rotate-3d': 'rotate-3d 20s linear infinite',
				'flip-3d': 'flip-3d 0.8s ease-in-out',
				'drawing-motion': 'drawing-motion 2s ease-in-out infinite',
				'subtle-float': 'subtle-float 3s ease-in-out infinite',
				'breathe': 'breathe 4s ease-in-out infinite',
				'watercolor-bloom': 'watercolor-bloom 0.8s ease-out',
				'countdown-pulse': 'countdown-pulse 1s ease-in-out infinite',
				'neural-pulse': 'neural-pulse 3s ease-in-out infinite',
				'confetti-fall': 'confetti-fall 3s linear infinite',
				'camera-focus': 'camera-focus 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
