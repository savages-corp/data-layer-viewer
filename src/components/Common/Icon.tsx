import type { IconType } from 'react-icons'
import { ServiceType } from '@/types/service'
import React from 'react'

import { DiGoogleCloudPlatform } from 'react-icons/di'
import { FaArrowTurnUp, FaAws, FaClipboard, FaDatabase, FaFileExport, FaGlobe, FaHubspot, FaSalesforce, FaSlack, FaTrashCan, FaWarehouse } from 'react-icons/fa6'
import { PiArrowArcLeftBold } from 'react-icons/pi'
import { TbBrandZapier } from 'react-icons/tb'
import { VscAzure } from 'react-icons/vsc'

interface IconProps extends React.SVGProps<SVGElement> {
  variant?: ServiceType | string
  color?: string
  size?: number
}

const iconMap: Record<string, IconType> = {
  trash: FaTrashCan,
  arrowCurved: PiArrowArcLeftBold,
  arrowUp: FaArrowTurnUp,
  export: FaFileExport,
  clipboard: FaClipboard,

  // ServiceType matching icons.
  CommonAws: FaAws,
  CommonAzure: VscAzure,
  CommonGcp: DiGoogleCloudPlatform,
  CommonHubspot: FaHubspot,
  CommonSalesforce: FaSalesforce,
  CommonSlack: FaSlack,
  CommonZapier: TbBrandZapier,

  GenericDatabase: FaDatabase,
  GenericHttp: FaGlobe,

  InfrastructureDb: FaDatabase,
  InfrastructureWarehouse: FaWarehouse,
}

const colorMap: Record<string, string> = {
  CommonAws: '#ee8421',
  CommonAzure: '#0078d4',
  CommonGcp: '#333',
  CommonHubspot: '#ff7a59',
  CommonSalesforce: '#00a1e0',
  CommonSlack: '#4a154b',
  CommonZapier: '#ff4a00',

  GenericDatabase: '#333',
  GenericHttp: '#333',

  InfrastructureDb: '#0078d4',
  InfrastructureWarehouse: '#333',
}

export const Icon: React.FC<IconProps> = ({ color = '', variant = 'database', size = 16, ...svgProps }) => {
  // Try to derive the enum key if variant matches a ServiceType value
  const serviceKey = (() => {
    // Check if variant is one of the ServiceType values
    const enumKeys = Object.keys(ServiceType) as Array<keyof typeof ServiceType>
    const key = enumKeys.find(k => ServiceType[k] === variant)
    return key || variant
  })()

  const SpecificIcon = iconMap[serviceKey] || FaSalesforce

  return (
    <div className="icon">
      <SpecificIcon color={color || colorMap[serviceKey]} size={size} {...svgProps} />
    </div>
  )
}
