import type { Service } from '@/types/service'
import type { IconType } from 'react-icons'
import React from 'react'

import { FaDatabase, FaSalesforce } from 'react-icons/fa6'

interface IconProps extends React.SVGProps<SVGElement> {
  variant?: Service
  color?: string
  size?: number
}

const iconMap: Record<string, IconType> = {
  database: FaDatabase,
  salesforce: FaSalesforce,
  // ...other icons can be added here
}

const colorMap: Record<string, string> = {
  database: '#ff7090',
  salesforce: '#00a1e0',
  // ...other colors can be added here
}

export const Icon: React.FC<IconProps> = ({ color = '', variant = 'database', size = 16, ...svgProps }) => {
  const SpecificIcon = iconMap[variant] || FaSalesforce

  const style = {
    marginTop: `-${size / 2}px`,
    marginLeft: `-${size / 2}px`,
  }

  return (
    <div className="icon" style={style}>
      <SpecificIcon color={color || colorMap[variant]} size={size} {...svgProps} />
    </div>
  )
}
