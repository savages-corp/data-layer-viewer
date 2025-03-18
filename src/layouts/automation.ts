import type { AnnotationNode } from '@/components/Nodes/AnnotationNode'
import type { ServiceNode } from '@/components/Nodes/ServiceNode'
import type { AppEdge, AppNode } from '@/src/App'
import type { TranslationKey } from '@/types/i18n'
import type { Ti18n } from '@zealsprince/ti18n'
import type { FlowPrefab } from '../prefabs/flow'
import type { Layout, LayoutDefinition } from './layouts'
import { ServiceType } from '@/types/service'
import { Status } from '@/types/status'
import { getTimedId } from '../helpers/nodes'
import { calculateNextFlowY } from '../helpers/positioning'
import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'

function builder({ ti18n }: { ti18n: Ti18n<TranslationKey>, mobile?: boolean }) : (Layout) {
  const datalayer = CreateDatalayerPrefab(1)

  // First flow: Data Layer Warehouse to n8n
  const warehouseSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: -224 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Company Data Warehouse',
        type: ServiceType.GenericWarehouse,
        parameters: {
          warehouseUrl: 'warehouse.company.internal',
          accessKey: '',
          secretKey: '',
          region: 'us-east-1',
        },
      },
    },
  }

  const n8nDestination: ServiceNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: { x: 0, y: -224 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'n8n Workflow Engine',
        type: ServiceType.CommonN8n,
        parameters: {
          apiKey: '',
          webhookUrl: '',
          baseUrl: 'https://n8n.company.internal',
          workflowId: 'contracts-to-tickets',
          username: '',
          password: '',
        },
      },
    },
  }

  // Second flow: n8n to Hubspot
  const n8nSource: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: -128 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'n8n Workflow Engine',
        type: ServiceType.CommonN8n,
        parameters: {
          apiKey: '',
          webhookUrl: '',
          baseUrl: 'https://n8n.company.internal',
          workflowId: 'tickets-creation',
          username: '',
          password: '',
        },
      },
    },
  }

  const hubspotDestination: ServiceNode = {
    id: getTimedId('service-destination-2'),
    type: 'service',
    position: { x: 0, y: -128 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Customer Ticketing',
        type: ServiceType.CommonHubspot,
        parameters: {
          apiKey: '',
          portalId: 'company-portal',
          oauthToken: '',
        },
      },
    },
  }

  // Third flow: Hubspot back to Data Layer Warehouse
  const hubspotToWarehouseFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))
  const hubspotSource: ServiceNode = {
    id: getTimedId('service-source-3'),
    type: 'service',
    position: { x: -312, y: -19 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Customer Ticketing',
        type: ServiceType.CommonHubspot,
        parameters: {
          apiKey: '',
          portalId: 'company-portal',
          oauthToken: '',
        },
      },
    },
  }

  // Annotations to explain the workflow
  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: 0, y: -48 },
    width: 224,
    data: {
      text: ti18n.translate(ti18n.keys.annotationAutomationWarehouseExport),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'bottom-right',
    },
    parentId: warehouseSource.id,
    draggable: false,
    selectable: false,
  }

  const annotation2: AnnotationNode = {
    id: getTimedId('annotation-2'),
    type: 'annotation',
    position: { x: -24, y: -42 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationAutomationN8nProcess),
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'bottom-left',
    },
    parentId: n8nSource.id,
    draggable: false,
    selectable: false,
  }

  const annotation3: AnnotationNode = {
    id: getTimedId('annotation-3'),
    type: 'annotation',
    position: { x: -8, y: 52 },
    width: 236,
    data: {
      text: ti18n.translate(ti18n.keys.annotationAutomationHubspotSync),
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'top-left',
    },
    parentId: hubspotSource.id,
    draggable: false,
    selectable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),

    // First flow
    warehouseSource,
    n8nDestination,

    // Second flow
    n8nSource,
    hubspotDestination,

    // Third flow with Data Layer
    hubspotSource,
    ...Object.values(hubspotToWarehouseFlow),

    // Annotations
    annotation1,
    annotation2,
    annotation3,
  ] satisfies AppNode[]

  const edges: AppEdge[] = [
    // First flow edges
    { id: 'warehouse-n8n-1', source: warehouseSource.id, target: n8nDestination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },

    // Second flow edges
    { id: 'pull-modelize-2', source: n8nSource.id, target: hubspotDestination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },

    // Third flow edges
    { id: 'pull-modelize-3', source: hubspotSource.id, target: hubspotToWarehouseFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-warehouse', source: hubspotToWarehouseFlow.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
  ] satisfies AppEdge[]

  const flows = [hubspotToWarehouseFlow] satisfies FlowPrefab[]
  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,
  } satisfies Layout

  return layout
}

export const AutomationDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutAutomation) as string,
  builder,
} satisfies LayoutDefinition
