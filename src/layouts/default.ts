import type { AppEdge, AppNode } from '@/src/App'
import type { AnnotationNode } from '../components/Nodes/AnnotationNode'

import type { ServiceNode } from '../components/Nodes/ServiceNode'
import type { Layout, LayoutDefinition } from './layouts'

import { ServiceType } from '@/types/service'
import { Status } from '@/types/status'

import { getTimedId } from '../helpers/nodes'
import { calculateNextFlowY } from '../helpers/positioning'
import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'

function builder() : (Layout) {
  const datalayer = CreateDatalayerPrefab(2)

  const source1: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: 48 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Database',
        type: ServiceType.GenericDatabase,
      },
    },
  }

  const source2: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: -48 },
    data: {
      status: Status.Success,
      configuration: {
        type: ServiceType.CommonHubspot,
        identifier: 'Hubspot',
      },
    },
  }

  const destination1: ServiceNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: { x: 296, y: 48 },
    data: {
      status: Status.Success,
      configuration: {
        type: ServiceType.CommonSalesforce,
        identifier: 'Salesforce',
      },
    },
  }

  const destination2: ServiceNode = {
    id: getTimedId('service-destination-2'),
    type: 'service',
    position: { x: 296, y: -48 },
    data: {
      status: Status.Success,
      configuration: {
        type: ServiceType.CommonSlack,
        identifier: 'Slack',
      },
    },
  }

  const flow1 = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(0))
  const flow2 = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(1))

  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: 32, y: 56 },
    width: 200,
    data: {
      text: 'Sources pull data to a given destination\n(They have a single output)',
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
    },
    parentId: source1.id,
    draggable: false,
  }

  const annotation2: AnnotationNode = {
    id: getTimedId('annotation-2'),
    type: 'annotation',
    position: { x: -8, y: -32 },
    width: 300,
    data: {
      text: 'Data is validated, standardized and optionally warehoused',
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'bottom-left',
    },
    parentId: flow2.modelize.id,
    draggable: false,
  }

  const annotation3: AnnotationNode = {
    id: getTimedId('annotation-3'),
    type: 'annotation',
    position: { x: -8, y: 56 },
    width: 300,
    data: {
      text: 'Data is pushed to a destination completing a flow',
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'top-left',
    },
    parentId: destination1.id,
    draggable: false,
  }

  const annotationFlow: AnnotationNode = {
    id: getTimedId('annotation-flow'),
    type: 'annotation',
    position: { x: -22, y: -32 },
    width: 300,
    data: {
      text: 'Try connecting a flow yourself!',
      textAlignment: 'center',
    },
    parentId: flow1.container.id,
    draggable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),
    source1,
    source2,
    destination1,
    destination2,
    ...Object.values(flow1),
    ...Object.values(flow2),

    annotation1,
    annotation2,
    annotation3,
    annotationFlow,
    // Data Layer container sub-flow
  ] satisfies AppNode[]

  // The initial state of the graph.
  const edges: AppEdge[] = [
    { id: 'pull-modelize-1', source: source1.id, target: flow2.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-1', source: flow2.modelize.id, target: flow2.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-1', source: flow2.egress.id, target: destination1.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'warehouse-1', source: flow2.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },

  ] satisfies AppEdge[]

  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows: [flow1, flow2],
  } satisfies Layout

  return layout
}

export const DefaultDefinition: LayoutDefinition = {
  name: '(Default)',
  builder,

} satisfies LayoutDefinition
