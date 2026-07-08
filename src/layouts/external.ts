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

  const httpSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: -64 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: '3rd Party Service',
        type: ServiceType.GenericHttp,
        parameters: {
          clientId: '',
          clientSecret: '',
          hostAddress: 'api.thirdparty.com',
          hostPort: 443,
          hostSecure: true,
          strict: true,
        },
      },
    },
  }

  const salesforceDestination: ServiceNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: { x: 296, y: -64 },
    data: {
      status: Status.Success,
      configuration: {
        type: ServiceType.CommonSalesforce,
        identifier: 'Salesforce',
        parameters: {
          instanceUrl: 'example.sandbox.my.salesforce.com',
          consumerId: '',
          consumerSecret: '',
        },
      },
    },
  }

  const inboundFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))

  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: -76, y: 52 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationExternalInbound),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
    },
    parentId: httpSource.id,
    draggable: false,
    selectable: false,
  }

  const outboundFlow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(1))
  const salesforceSource: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: 96 },
    data: {
      status: Status.Success,
      configuration: {
        type: ServiceType.CommonSalesforce,
        identifier: 'Salesforce',
        parameters: {
          instanceUrl: 'example.sandbox.my.salesforce.com',
          consumerId: '',
          consumerSecret: '',
        },
      },
    },
  }

  const httpDestination: ServiceNode = {
    id: getTimedId('service-destination-2'),
    type: 'service',
    position: { x: 296, y: 96 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: '3rd Party Service',
        type: ServiceType.GenericHttp,
        parameters: {
          clientId: '',
          clientSecret: '',
          hostAddress: 'api.thirdparty.com',
          hostPort: 443,
          hostSecure: true,
          strict: true,
        },
      },
    },
  }

  const annotation2: AnnotationNode = {
    id: getTimedId('annotation-2'),
    type: 'annotation',
    position: { x: -86, y: -42 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationExternalOutbound),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'bottom-right',
    },
    parentId: httpDestination.id,
    draggable: false,
    selectable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),
    httpSource,
    salesforceDestination,
    ...Object.values(inboundFlow),
    annotation1,
    salesforceSource,
    httpDestination,
    ...Object.values(outboundFlow),
    annotation2,
  ] satisfies AppNode[]

  const edges: AppEdge[] = [
    { id: 'pull-modelize-1', source: httpSource.id, target: inboundFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-1', source: inboundFlow.modelize.id, target: inboundFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-1', source: inboundFlow.egress.id, target: salesforceDestination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },

    { id: 'pull-modelize-2', source: salesforceSource.id, target: outboundFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-2', source: outboundFlow.modelize.id, target: outboundFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-2', source: outboundFlow.egress.id, target: httpDestination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
  ] satisfies AppEdge[]

  const flows = [inboundFlow, outboundFlow] satisfies FlowPrefab[]
  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,
  } satisfies Layout

  return layout
}

export const ExternalDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutExternal),
  builder,
} satisfies LayoutDefinition
