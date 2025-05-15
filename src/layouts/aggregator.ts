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
  const datalayer = CreateDatalayerPrefab(2)

  const awsSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: -64 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'AWS (S3)',
        type: ServiceType.GenericHypervisorAws,
        parameters: {
          accessKeyId: '',
          secretAccessKey: '',
          region: 'us-east-1',
        },
      },
    },
  }

  const aiDestination: ServiceNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: { x: 296, y: -64 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'AI Processing API',
        type: ServiceType.GenericHttp,
        parameters: {
          clientId: '',
          clientSecret: '',
          hostAddress: 'ai-api.example.com',
          hostPort: 443,
          hostSecure: true,
          strict: true,
        },
      },
    },
  }

  const awsFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))

  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: -72, y: 52 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationAggregatorDocs),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
    },
    parentId: awsSource.id,
    draggable: false,
    selectable: false,
  }

  // If not mobile, add Azure blob storage flow
  const azureFlow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(1))
  const azureSource: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: 96 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Azure (Blob Storage)',
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

  const aiDestination2: ServiceNode = {
    id: getTimedId('service-destination-2'),
    type: 'service',
    position: { x: 296, y: 96 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'AI Processing API',
        type: ServiceType.GenericHttp,
        parameters: {
          clientId: '',
          clientSecret: '',
          hostAddress: 'ai-api.example.com',
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
    position: { x: -74, y: 52 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationAggregatorAi),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
    },
    parentId: aiDestination.id,
    draggable: false,
    selectable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),

    awsSource,
    aiDestination,
    annotation1,
    ...Object.values(awsFlow),

    azureSource,
    aiDestination2,
    annotation2,
    ...Object.values(azureFlow),
  ] satisfies AppNode[]

  const edges: AppEdge[] = [
    { id: 'pull-modelize-1', source: awsSource.id, target: awsFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-1', source: awsFlow.modelize.id, target: awsFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-1', source: awsFlow.egress.id, target: aiDestination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },

    { id: 'pull-modelize-2', source: azureSource.id, target: azureFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-2', source: azureFlow.modelize.id, target: azureFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-2', source: azureFlow.egress.id, target: aiDestination2.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
  ] satisfies AppEdge[]

  const flows = [awsFlow, azureFlow] satisfies FlowPrefab[]

  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,
  } satisfies Layout

  return layout
}

export const AggregatorDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutAggregator),
  builder,
} satisfies LayoutDefinition
