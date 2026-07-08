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
import { calculateNextFlowY } from '../helpers/positioning'
import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'

function builder({ ti18n }: { ti18n: Ti18n<TranslationKey>, mobile?: boolean }): (Layout) {
  const datalayer = CreateDatalayerPrefab(4)

  const awsFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))
  const awsSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: -91 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'AWS (Auto Insurance)',
        type: ServiceType.GenericHypervisorAws,
        parameters: {
          accessKeyId: '',
          secretAccessKey: '',
          region: 'us-east-1',
        },
      },
    },
  }

  const warehouseDestination1: ServiceNode = {
    id: getTimedId('warehouse-destination-1'),
    type: 'service',
    position: { x: 296, y: -91 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'All-in-one Suite',
        type: ServiceType.GenericWarehouse,
        parameters: {
          warehouseUrl: '',
          accessKey: '',
          secretKey: '',
          region: 'us-east-1',
        },
      },
    },
  }

  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: 0, y: 0 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationPortfolioCloud),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'bottom-right',
    },
    parentId: datalayer.container.id,
    draggable: false,
    selectable: false,
  }

  // Add Azure flow for Home Insurance
  const azureFlow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(1))
  const azureSource: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: -19 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Azure (Home Insurance)',
        type: ServiceType.GenericHypervisorAzure,
        parameters: {
          tenantId: '',
          clientId: '',
          clientSecret: '',
          subscriptionId: '',
        },
      },
    },
  }

  const warehouseDestination2: ServiceNode = {
    id: getTimedId('warehouse-destination-2'),
    type: 'service',
    position: { x: 296, y: -19 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'All-in-one Suite',
        type: ServiceType.GenericWarehouse,
        parameters: {
          warehouseUrl: '',
          accessKey: '',
          secretKey: '',
          region: 'us-east-1',
        },
      },
    },
  }

  // Add GCP flow for Health Insurance
  const gcpFlow = CreateFlowPrefab(datalayer.container, '3', 24, calculateNextFlowY(2))
  const gcpSource: ServiceNode = {
    id: getTimedId('service-source-3'),
    type: 'service',
    position: { x: -312, y: 53 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'GCP (Health Insurance)',
        type: ServiceType.GenericHypervisorGcp,
        parameters: {
          projectId: '',
          serviceAccountKey: '',
          zone: 'us-central1-a',
        },
      },
    },
  }

  const warehouseDestination3: ServiceNode = {
    id: getTimedId('warehouse-destination-3'),
    type: 'service',
    position: { x: 296, y: 53 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'All-in-one Suite',
        type: ServiceType.GenericWarehouse,
        parameters: {
          warehouseUrl: '',
          accessKey: '',
          secretKey: '',
          region: 'us-east-1',
        },
      },
    },
  }

  const warehouseFlow = CreateFlowPrefab(datalayer.container, '4', 24, calculateNextFlowY(3))
  const warehouseSource = {
    id: getTimedId('warehouse-source'),
    type: 'service',
    position: { x: -312, y: 125 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'All-in-one Suite',
        type: ServiceType.GenericWarehouse,
        parameters: {
          warehouseUrl: '',
          accessKey: '',
          secretKey: '',
          region: 'us-east-1',
        },
      },
    },
  }

  const annotation2: AnnotationNode = {
    id: getTimedId('annotation-2'),
    type: 'annotation',
    position: { x: -8, y: 52 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationPortfolioUnified),
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'top-left',
    },
    parentId: warehouseSource.id,
    draggable: false,
    selectable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),

    awsSource,
    warehouseDestination1,
    annotation1,
    ...Object.values(awsFlow),

    azureSource,
    warehouseDestination2,
    ...Object.values(azureFlow),

    gcpSource,
    warehouseDestination3,
    ...Object.values(gcpFlow),

    warehouseSource,
    annotation2,
    ...Object.values(warehouseFlow),
  ] satisfies AppNode[]

  const edges: AppEdge[] = [
    { id: 'pull-modelize-1', source: awsSource.id, target: awsFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-1', source: awsFlow.modelize.id, target: awsFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-1', source: awsFlow.egress.id, target: warehouseDestination1.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },

    // Azure flow edges
    { id: 'pull-modelize-2', source: azureSource.id, target: azureFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-2', source: azureFlow.modelize.id, target: azureFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-2', source: azureFlow.egress.id, target: warehouseDestination2.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },

    // GCP flow edges
    { id: 'pull-modelize-3', source: gcpSource.id, target: gcpFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-3', source: gcpFlow.modelize.id, target: gcpFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-3', source: gcpFlow.egress.id, target: warehouseDestination3.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },

    // Warehouse flow edges
    { id: 'pull-modelize-4', source: warehouseSource.id, target: warehouseFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-warehouse-1', source: warehouseFlow.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },

  ] satisfies AppEdge[]

  const flows = [awsFlow, azureFlow, gcpFlow, warehouseFlow] satisfies FlowPrefab[]
  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,
  } satisfies Layout

  return layout
}

export const PortfolioDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutPortfolio),
  builder,
} satisfies LayoutDefinition
