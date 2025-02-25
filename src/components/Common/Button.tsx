import React from 'react'

enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Destructive = 'destructive',
  Ghost = 'ghost',
}

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  type?: ButtonType
}

export const Button: React.FC<ButtonProps> = (
  {
    type,
    children,
    style,
    onClick,
    className,
    ...props
  },
) => {
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
      className={`button button-${type || ButtonType.Primary} ${className || ''}`.trim()}
    >
      {children}
    </div>
  )
}

export default Button
