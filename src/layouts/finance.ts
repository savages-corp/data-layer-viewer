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
  const datalayer = CreateDatalayerPrefab(2)

  const paypalSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: -64 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'PayPal',
        type: ServiceType.CommonPaypal,
        parameters: {
          clientId: '',
          clientSecret: '',
          environment: 'sandbox',
        },
      },
    },
  }

  const paypalFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))

  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: -16, y: -32 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationFinancePayment),
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'bottom-left',
    },
    parentId: paypalFlow.modelize.id,
    draggable: false,
    selectable: false,
  }

  const annotation2: AnnotationNode = {
    id: getTimedId('annotation-2'),
    type: 'annotation',
    position: { x: -16, y: 42 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationFinanceWarehouse),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
    },
    parentId: datalayer.warehouse.id,
    draggable: false,
    selectable: false,
  }

  const stripeFlow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(1))
  const stripeSource: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: 96 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Stripe',
        type: ServiceType.CommonStripe,
        parameters: {
          secretKey: '',
          publishableKey: '',
          webhookSecret: '',
        },
      },
    },
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),
    paypalSource,
    stripeSource,
    ...Object.values(paypalFlow),
    ...Object.values(stripeFlow),
    annotation1,
    annotation2,
  ] satisfies AppNode[]

  const edges: AppEdge[] = [
    { id: 'pull-modelize-1', source: paypalSource.id, target: paypalFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'warehouse-1', source: paypalFlow.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'pull-modelize-2', source: stripeSource.id, target: stripeFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'warehouse-2', source: stripeFlow.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
  ]

  const flows = [paypalFlow, stripeFlow] satisfies FlowPrefab[]
  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,
  } satisfies Layout

  return layout
}

export const FinanceDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutFinance),
  builder,
} satisfies LayoutDefinition
