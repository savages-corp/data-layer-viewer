import React from 'react'

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ children, style, onClick, className, ...props }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (onClick)
        onClick(e as any)
    }
  }

  return (
    <div
      {...props}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`button ${className || ''}`.trim()}
    >
      {children}
    </div>
  )
}

export default Button
