import type { Ti18n } from '@zealsprince/ti18n'
import type { FlowPrefab } from '../prefabs/flow'
import type { Layout, LayoutDefinition } from './layouts'
import type { AnnotationNode } from '@/components/Nodes/AnnotationNode'
import type { ServiceNode } from '@/components/Nodes/ServiceNode'
import type { AppEdge, AppNode } from '@/src/App'
import type { TranslationKey } from '@/types/i18n'
import { ServiceType } from '@/types/service'
import { Status } from '@/types/status'
import { getTimedId } from '../helpers/nodes'
import { calculateDataLayerHeight, calculateNextFlowY } from '../helpers/positioning'
import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'

/*
  Manufacturing Data Platform: the medallion architecture as it runs in the data layer infrastructure.
    - Sources (ERP, shop, shop-floor events) stream raw records into Bronze.
    - Shared transformations conform them into Silver and curate them into Gold.
    - The platform application, AI/ML workloads and reporting all consume the same Gold layer.
*/
function builder({ ti18n }: { ti18n: Ti18n<TranslationKey>, mobile?: boolean }): (Layout) {
  const flowCount = 3
  const datalayer = CreateDatalayerPrefab(flowCount)

  // Services sit 12px above their flow so the connection handles line up.
  const serviceY = (index: number) => -16 - (24 * flowCount - 1) + calculateNextFlowY(index) - 12

  const erpSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: serviceY(0) },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'ERP (Parts, BOM)',
        type: ServiceType.GenericDatabase,
        parameters: {
          host: 'erp.example.com',
          port: 5432,
          database: 'erp',
          username: '',
          password: '',
          ssl: true,
        },
      },
    },
  }

  const shopSource: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: serviceY(1) },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Shop (WooCommerce)',
        type: ServiceType.GenericHttp,
        parameters: {
          clientId: '',
          clientSecret: '',
          hostAddress: 'shop.example.com',
          hostPort: 443,
          hostSecure: true,
          strict: true,
        },
      },
    },
  }

  const eventsSource: ServiceNode = {
    id: getTimedId('service-source-3'),
    type: 'service',
    position: { x: -312, y: serviceY(2) },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Shop Floor Events',
        type: ServiceType.GenericQueue,
        parameters: {
          bootstrapServers: 'kafka.example.com:9095',
          topic: 'tenant.eol.eol_reports',
          username: '',
          password: '',
        },
      },
    },
  }

  const appDestination: ServiceNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: { x: 296, y: serviceY(0) },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Platform App',
        type: ServiceType.GenericHttp,
        parameters: {
          clientId: '',
          clientSecret: '',
          hostAddress: 'app.example.com',
          hostPort: 443,
          hostSecure: true,
          strict: true,
        },
      },
    },
  }

  const aiDestination: ServiceNode = {
    id: getTimedId('service-destination-2'),
    type: 'service',
    position: { x: 296, y: serviceY(1) },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'AI / ML (SPPAP)',
        type: ServiceType.GenericHttp,
        parameters: {
          clientId: '',
          clientSecret: '',
          hostAddress: 'sppap.example.com',
          hostPort: 443,
          hostSecure: true,
          strict: true,
        },
      },
    },
  }

  const reportingDestination: ServiceNode = {
    id: getTimedId('service-destination-3'),
    type: 'service',
    position: { x: 296, y: serviceY(2) },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Reporting (Trino)',
        type: ServiceType.GenericWarehouse,
        parameters: {
          host: 'trino.example.com',
          port: 443,
          catalog: 'iceberg',
          username: '',
          password: '',
        },
      },
    },
  }

  const erpFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))
  const shopFlow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(1))
  const eventsFlow = CreateFlowPrefab(datalayer.container, '3', 24, calculateNextFlowY(2))

  // Legend for the three layers, placed underneath the Data Layer.
  const layerLegend: AnnotationNode = {
    id: getTimedId('annotation-layers'),
    type: 'annotation',
    position: { x: -4, y: calculateDataLayerHeight(flowCount) + 12 },
    width: 308,
    data: {
      text: [
        ti18n.translate(ti18n.keys.annotationMedallionBronze),
        ti18n.translate(ti18n.keys.annotationMedallionSilver),
        ti18n.translate(ti18n.keys.annotationMedallionGold),
      ].join('\n'),
      textAlignment: 'center',
    },
    parentId: datalayer.container.id,
    draggable: false,
    selectable: false,
  }

  const consumersAnnotation: AnnotationNode = {
    id: getTimedId('annotation-consumers'),
    type: 'annotation',
    position: { x: -8, y: 56 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationMedallionConsumers),
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'top-left',
    },
    parentId: reportingDestination.id,
    draggable: false,
    selectable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),

    erpSource,
    shopSource,
    eventsSource,

    appDestination,
    aiDestination,
    reportingDestination,

    ...Object.values(erpFlow),
    ...Object.values(shopFlow),
    ...Object.values(eventsFlow),

    layerLegend,
    consumersAnnotation,
  ] satisfies AppNode[]

  const flowEdges = (flow: FlowPrefab, source: ServiceNode, destination: ServiceNode, index: number): AppEdge[] => [
    { id: `pull-ingest-${index}`, source: source.id, target: flow.ingest.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: `ingest-modelize-${index}`, source: flow.ingest.id, target: flow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: `modelize-egress-${index}`, source: flow.modelize.id, target: flow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: `egress-push-${index}`, source: flow.egress.id, target: destination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: `warehouse-${index}`, source: flow.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
  ]

  const edges: AppEdge[] = [
    ...flowEdges(erpFlow, erpSource, appDestination, 1),
    ...flowEdges(shopFlow, shopSource, aiDestination, 2),
    ...flowEdges(eventsFlow, eventsSource, reportingDestination, 3),
  ] satisfies AppEdge[]

  const flows = [erpFlow, shopFlow, eventsFlow] satisfies FlowPrefab[]

  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,
  } satisfies Layout

  return layout
}

export const MedallionDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutMedallion),
  builder,
} satisfies LayoutDefinition
