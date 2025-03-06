import type { AnnotationNode } from '@/components/Nodes/AnnotationNode'
import type { ServiceNode } from '@/components/Nodes/ServiceNode'

import type { AppEdge, AppNode } from '@/src/App'

import type { TranslationKey } from '@/types/i18n'
import type { Ti18n } from '@zealsprince/ti18n'

import type { Layout, LayoutDefinition } from './layouts'

import { ServiceType } from '@/types/service'
import { Status } from '@/types/status'

import { getTimedId } from '../helpers/nodes'
import { calculateNextFlowY } from '../helpers/positioning'

import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'

function builder({ ti18n, mobile = false }: { ti18n: Ti18n<TranslationKey>, mobile?: boolean }) : (Layout) {
  const datalayer = CreateDatalayerPrefab(mobile ? 1 : 2)

  const presetSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: mobile ? { x: -48, y: -164 } : { x: -312, y: -64 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: ti18n.translate(ti18n.keys.serviceGenericDatabase),
        type: ServiceType.GenericDatabase,
        parameters: {
          host: 'db.example.com',
          port: 5432,
          database: 'production',
          username: '',
          password: '',
          ssl: true,
        },
      },
    },
  }

  const presetDestination: ServiceNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: mobile ? { x: 32, y: 182 } : { x: 296, y: -64 },
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

  const presetFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))

  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: 32, y: 56 },
    width: 200,
    data: {
      text: ti18n.translate(ti18n.keys.annotationSource),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
    },
    parentId: presetSource.id,
    draggable: false,
    selectable: false,
  }

  const annotation2: AnnotationNode = {
    id: getTimedId('annotation-2'),
    type: 'annotation',
    position: { x: -8, y: -32 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationModelize),
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'bottom-left',
    },
    parentId: presetFlow.modelize.id,
    draggable: false,
    selectable: false,
  }

  const annotation3: AnnotationNode = {
    id: getTimedId('annotation-3'),
    type: 'annotation',
    position: mobile ? { x: -86, y: -42 } : { x: -8, y: 56 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationDestination),
      textAlignment: mobile ? 'right' : 'left',
      showArrow: true,
      arrowPosition: mobile ? 'bottom-right' : 'top-left',
    },
    parentId: presetDestination.id,
    draggable: false,
    selectable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),
    presetSource,
    presetDestination,
    ...Object.values(presetFlow),

    annotation1,
    annotation2,
    annotation3,
    // Data Layer container sub-flow
  ] satisfies AppNode[]

  // The initial state of the graph.
  const edges: AppEdge[] = [
    { id: 'pull-modelize-1', source: presetSource.id, target: presetFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-1', source: presetFlow.modelize.id, target: presetFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-1', source: presetFlow.egress.id, target: presetDestination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'warehouse-1', source: presetFlow.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },

  ] satisfies AppEdge[]

  const flows = [presetFlow]

  // If we're not on mobile, add a second flow and some extra nodes.
  if (!mobile) {
    const extraFlow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(1))
    const desktopNodes: AppNode[] = [
      {
        id: getTimedId('service-source-2'),
        type: 'service',
        position: { x: -312, y: 96 },
        data: {
          status: Status.Success,
          configuration: {
            type: ServiceType.CommonHubspot,
            identifier: 'Hubspot',
            parameters: {
              apiKey: '',
              portalId: 'demo123',
              oauthToken: '',
            },
          },
        },
      },
      {
        id: getTimedId('service-destination-2'),
        type: 'service',
        position: { x: 296, y: 96 },
        data: {
          status: Status.Success,
          configuration: {
            type: ServiceType.CommonSlack,
            identifier: 'Slack',
            parameters: {
              botToken: '',
              signingSecret: '',
              appId: 'A12BCDE3FG',
            },
          },
        },
      },

      ...Object.values(extraFlow),

      {
        id: getTimedId('annotation-flow'),
        type: 'annotation',
        position: { x: -22, y: -32 },
        width: 300,
        data: {
          text: ti18n.translate(ti18n.keys.annotationFlowConnect),
          textAlignment: 'center',
        },
        parentId: extraFlow.container.id,
        draggable: false,
        selectable: false,
      },
    ]

    nodes.push(...desktopNodes)
    flows.push(extraFlow)
  }

  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,

  } satisfies Layout

  return layout
}

export const DefaultDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutDefault) as string,
  builder,

} satisfies LayoutDefinition
