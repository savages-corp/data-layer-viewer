import type { IconType } from 'react-icons'
import { ServiceType } from '@/types/service'
import React from 'react'

import { BiNetworkChart } from 'react-icons/bi'
import { DiGoogleCloudPlatform, DiMongodb } from 'react-icons/di'
import { FaArrowTurnUp, FaAws, FaBuildingShield, FaClipboard, FaDatabase, FaFileExport, FaFileImport, FaGear, FaHubspot, FaJira, FaKitchenSet, FaMailchimp, FaMinus, FaPlug, FaPlus, FaRotate, FaSalesforce, FaScrewdriverWrench, FaSink, FaSlack, FaStripe, FaTrashCan, FaWarehouse } from 'react-icons/fa6'
import { PiArrowArcLeftBold } from 'react-icons/pi'
import { SiCircleci, SiClickup, SiDocker, SiIntercom, SiJenkins, SiMiro, SiN8N, SiNotion, SiOkta, SiPaypal, SiTrello, SiZendesk } from 'react-icons/si'
import { TbApi, TbBrandAsana, TbBrandAuth0, TbBrandGithub, TbBrandGitlab, TbBrandGraphql, TbBrandTwilio, TbBrandVercel, TbBrandZapier } from 'react-icons/tb'
import { VscAzure } from 'react-icons/vsc'

interface IconProps extends React.SVGProps<SVGElement> {
  readonly icon?: ServiceType | string
  readonly color?: string
  readonly size?: number
}

// If you're wondering about the limited selection of icons: due to this being an embedded component, we're trying to keep the bundle size down.
const iconMap: Record<string, IconType> = {
  default: FaScrewdriverWrench,

  // General icons
  arrowCurved: PiArrowArcLeftBold,
  arrowUp: FaArrowTurnUp,
  clipboard: FaClipboard,
  export: FaFileExport,
  gear: FaGear,
  import: FaFileImport,
  minus: FaMinus,
  plug: FaPlug,
  plus: FaPlus,
  refresh: FaRotate,
  trash: FaTrashCan,

  // Cloud platforms
  GenericHypervisorAws: FaAws,
  GenericHypervisorAzure: VscAzure,
  GenericHypervisorGcp: DiGoogleCloudPlatform,

  // SaaS - CRM & Marketing
  CommonHubspot: FaHubspot,
  CommonSalesforce: FaSalesforce,
  CommonMailchimp: FaMailchimp,
  CommonIntercom: SiIntercom,

  // SaaS - Project Management & Collaboration
  CommonSlack: FaSlack,
  CommonJira: FaJira,
  CommonAsana: TbBrandAsana,
  CommonZendesk: SiZendesk,
  CommonTrello: SiTrello,
  CommonClickup: SiClickup,
  CommonNotion: SiNotion,
  CommonMiro: SiMiro,

  // SaaS - Development & DevOps
  CommonGithub: TbBrandGithub,
  CommonGitlab: TbBrandGitlab,
  CommonZapier: TbBrandZapier,
  CommonVercel: TbBrandVercel,
  CommonCircleci: SiCircleci,
  CommonJenkins: SiJenkins,
  CommonDocker: SiDocker,
  CommonN8n: SiN8N,

  // SaaS - Identity & Auth
  CommonAuth0: TbBrandAuth0,
  CommonOkta: SiOkta,

  // SaaS - Payment & Finance
  CommonStripe: FaStripe,
  CommonTwilio: TbBrandTwilio,
  CommonPaypal: SiPaypal,

  // Generic services
  GenericDatabase: FaDatabase,
  GenericNoSql: DiMongodb,
  GenericHttp: TbApi,
  GenericGraphQL: TbBrandGraphql,
  GenericQueue: BiNetworkChart,
  GenericWarehouse: FaWarehouse,

  // Mock Services
  MockKitchen: FaKitchenSet,
  MockSink: FaSink,

  // Customer Services
  FreeyouSalesforceApiV60: FaSalesforce,
  FreeyouMsgPiaApi: FaBuildingShield,
}

const colorMap: Record<string, string> = {
  // Cloud platforms
  GenericHypervisorAws: '#ee8421',
  GenericHypervisorAzure: '#0078d4',
  GenericHypervisorGcp: '#333',

  // SaaS - CRM & Marketing
  CommonHubspot: '#ff7a59',
  CommonSalesforce: '#00a1e0',
  CommonMailchimp: '#ffe01b',
  CommonMarketo: '#5c4c9f',
  CommonPardot: '#00a1e0', // Same as Salesforce since Pardot is a Salesforce product
  CommonIntercom: '#1f8ded',

  // SaaS - Project Management & Collaboration
  CommonSlack: '#4a154b',
  CommonJira: '#0052cc',
  CommonConfluence: '#172b4d',
  CommonAsana: '#f06a6a',
  CommonZendesk: '#03363d',
  CommonTrello: '#0079bf',
  CommonClickup: '#7b68ee',
  CommonNotion: '#000000',
  CommonMiro: '#050038',

  // SaaS - Development & DevOps
  CommonGithub: '#333',
  CommonGitlab: '#fc6d26',
  CommonZapier: '#ff4a00',
  CommonVercel: '#000',
  CommonNetlify: '#00ad9f',
  CommonCircleci: '#343434',
  CommonJenkins: '#d24939',
  CommonDocker: '#2496ed',
  CommonN8n: '#e84b71',

  // SaaS - Identity & Auth
  CommonAuth0: '#eb5424',
  CommonOkta: '#00297a',
  CommonOnelogin: '#2c55cc',

  // SaaS - Payment & Finance
  CommonStripe: '#635bff',
  CommonTwilio: '#f22f46',
  CommonPaypal: '#003087',
  CommonSquare: '#3e4348',
  CommonBraintree: '#4d95dd',
  CommonChargify: '#ed3659',

  // Generic services
  GenericDatabase: '#333',
  GenericNoSql: '#4DB33D',
  GenericHttp: '#333',
  GenericGraphQL: '#e535ab',
  GenericRestApi: '#0d7acc',
  GenericQueue: '#61dafb',
  GenericWarehouse: '#333',

  // Mock Services
  MockKitchen: '#333',
  MockSink: '#333',

  // Customer Services
  FreeyouSalesforceApiV60: '#00a1e0',
  FreeyouMsgPiaApi: '#ae2200',
}

export const Icon: React.FC<IconProps> = ({ color = '', icon = 'default', size = 16, ...svgProps }) => {
  // Try to derive the enum key if variant matches a ServiceType value
  const serviceKey = (() => {
    // Check if variant is one of the ServiceType values
    const enumKeys = Object.keys(ServiceType) as Array<keyof typeof ServiceType>
    const key = enumKeys.find(k => ServiceType[k] === icon)
    return key ?? icon
  })()

  const SpecificIcon = iconMap[serviceKey] ?? FaScrewdriverWrench

  return (
    <div className="icon">
      <SpecificIcon color={color || colorMap[serviceKey]} size={size} {...svgProps} />
    </div>
  )
}
