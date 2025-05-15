import React from 'react'

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Destructive = 'destructive',
  Ghost = 'ghost',
}

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  readonly children: React.ReactNode
  readonly type?: ButtonType
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (onClick)
        onClick(e as any)
    }
  }

  return (
    <button
      {...props}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`button button-${type ?? ButtonType.Primary} ${className}`.trim()}
    >
      {children}
    </button>
  )
}
