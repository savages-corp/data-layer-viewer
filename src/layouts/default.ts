import type { AppEdge, AppNode } from '@/src/App'
import type { AnnotationNode } from '../components/Nodes/AnnotationNode'

import type { ContainerNode } from '../components/Nodes/ContainerNode'
import type { ServiceNode } from '../components/Nodes/ServiceNode'
import type { WarehouseNode } from '../components/Nodes/WarehouseNode'
import type { Layout, LayoutDefinition } from './layouts'

import { Service } from '@/types/service'
import { Status } from '@/types/status'

import { CreateFlowPrefab } from '../components/Prefabs/FlowPrefab'
import { getTimedId } from '../helpers/id'
import { calculateDataLayerHeight, calculateDataLayerY, calculateNextFlowY, calculateWarehouseY } from '../helpers/positioning'

function builder() : (Layout) {
  const datalayerHeight = calculateDataLayerHeight(2)
  const datalayer: ContainerNode = {
    id: getTimedId('datalayer'),
    type: 'container',
    position: { x: -48, y: calculateDataLayerY(2) },
    style: { width: 300, height: datalayerHeight },
    zIndex: -2,
    data: {
      annotation: 'Data Layer',
      annotationSize: 2,
      textColor: '#31c787',
      color: '#eaf9f3',
    },
    draggable: false,
    selectable: false,
  }

  const warehouse: WarehouseNode = {
    id: getTimedId('warehouse'),
    position: { x: 4, y: calculateWarehouseY(datalayerHeight) },
    style: { width: 292, height: 32 },
    type: 'warehouse',
    data: {
      label: 'Data Layer Warehouse',
    },
    parentId: datalayer.id,
    extent: 'parent',
    draggable: false,
  }

  const source1: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: 48 },
    data: {
      label: 'Database',
      status: Status.Success,
      service: Service.Database,
    },
  }

  const source2: ServiceNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: -48 },
    data: {
      label: 'Hubspot',
      status: Status.Success,
      service: Service.Hubspot,
    },
  }

  const destination1: ServiceNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: { x: 296, y: 48 },
    data: {
      label: 'Salesforce',
      status: Status.Success,
      service: Service.Salesforce,
    },
  }

  const destination2: ServiceNode = {
    id: getTimedId('service-destination-2'),
    type: 'service',
    position: { x: 296, y: -48 },
    data: {
      label: 'Slack',
      status: Status.Success,
      service: Service.Slack,
    },
  }

  const flow1 = CreateFlowPrefab(datalayer, '2', 24, calculateNextFlowY(0))
  const flow2 = CreateFlowPrefab(datalayer, '1', 24, calculateNextFlowY(1))

  const annotationMenu1: AnnotationNode = {
    id: getTimedId('annotation-menu-1'),
    type: 'annotation',
    position: { x: 0, y: 0 },
    width: 200,
    data: {
      text: 'Choose preset scenarios',
      textAlignment: 'left',
      showArrow: true,
      arrowPosition: 'top-left',
      isPinned: true,
      pinnedPosition: 'top-left',
    },
    draggable: false,
  }

  const annotationMenu2: AnnotationNode = {
    id: getTimedId('annotation-menu-2'),
    type: 'annotation',
    position: { x: 0, y: 0 },
    width: 200,
    data: {
      text: 'Add your own services',
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
      isPinned: true,
      pinnedPosition: 'top-right',
    },
    draggable: false,
  }

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
    source1,
    source2,
    destination1,
    destination2,
    datalayer,
    warehouse,
    ...Object.values(flow1),
    ...Object.values(flow2),

    annotationMenu1,
    annotationMenu2,
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
    { id: 'warehouse-1', source: flow2.modelize.id, target: warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },

  ] satisfies AppEdge[]

  const layout: Layout = {
    datalayer,
    warehouse,
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
