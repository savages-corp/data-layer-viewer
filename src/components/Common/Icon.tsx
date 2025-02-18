import type { Service } from '@/types/service'
import type { IconType } from 'react-icons'
import React from 'react'

import { DiGoogleCloudPlatform } from 'react-icons/di'
import { FaAws, FaDatabase, FaHubspot, FaLinkSlash, FaSalesforce, FaSlack, FaTrashCan, FaWarehouse } from 'react-icons/fa6'
import { PiArrowArcLeftBold } from 'react-icons/pi'
import { TbBrandZapier } from 'react-icons/tb'
import { VscAzure } from 'react-icons/vsc'

interface IconProps extends React.SVGProps<SVGElement> {
  variant?: Service | string
  color?: string
  size?: number
}

const iconMap: Record<string, IconType> = {
  trash: FaTrashCan,
  arrowCurved: PiArrowArcLeftBold,

  aws: FaAws,
  azure: VscAzure,
  broken: FaLinkSlash,
  database: FaDatabase,
  gcp: DiGoogleCloudPlatform,
  hubspot: FaHubspot,
  salesforce: FaSalesforce,
  slack: FaSlack,
  warehouse: FaWarehouse,
  zapier: TbBrandZapier,
  // ...other icons can be added here
}

const colorMap: Record<string, string> = {
  aws: '#ee8421',
  azure: '#0078d4',
  bomb: '#333',
  database: '#0078d4',
  gcp: '#333',
  hubspot: '#ff7a59',
  salesforce: '#00a1e0',
  slack: '#4a154b',
  warehouse: '#333',
  zapier: '#ff4a00',
  // ...other colors can be added here
}

export const Icon: React.FC<IconProps> = ({ color = '', variant = 'database', size = 16, ...svgProps }) => {
  const SpecificIcon = iconMap[variant] || FaSalesforce

  return (
    <div className="icon">
      <SpecificIcon color={color || colorMap[variant]} size={size} {...svgProps} />
    </div>
  )
}
