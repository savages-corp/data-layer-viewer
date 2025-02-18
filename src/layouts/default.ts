import type { AppEdge, AppNode } from 'src/App'
import type { Layout, LayoutDefinition } from './layouts'
import { CreateFlow } from '@/src/helpers/flow'

import { Service } from '@/types/service'
import { Status } from '@/types/status'
import { getTimedId } from '../helpers/id'

function builder() : (Layout) {
  const datalayer: AppNode = {
    id: getTimedId('data-layer'),
    type: 'container',
    position: { x: -50, y: -125 },
    style: { width: 300, height: 300 },
    zIndex: -2,
    data: {
      annotation: 'Data Layer',
      annotationSize: 2,
      label: 'Connect your own services!',
      labelSize: 2,
      textColor: '#31c787',
      color: '#eaf9f3',
    },
    draggable: false,
    selectable: false,
  }

  const source1: AppNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: 48 },
    data: {
      label: 'Database',
      status: Status.Success,
      service: Service.Database,
    },
  }

  const source2: AppNode = {
    id: getTimedId('service-source-2'),
    type: 'service',
    position: { x: -312, y: -48 },
    data: {
      label: 'Hubspot',
      status: Status.Success,
      service: Service.Hubspot,
    },
  }

  const destination1: AppNode = {
    id: getTimedId('service-destination-1'),
    type: 'service',
    position: { x: 296, y: 48 },
    data: {
      label: 'Salesforce',
      status: Status.Success,
      service: Service.Salesforce,
    },
  }

  const destination2: AppNode = {
    id: getTimedId('service-destination-2'),
    type: 'service',
    position: { x: 296, y: -48 },
    data: {
      label: 'Slack',
      status: Status.Success,
      service: Service.Slack,
    },
  }

  const warehouse: AppNode = {
    id: getTimedId('warehouse'),
    position: { x: 4, y: 264 },
    style: { width: 292, height: 32 },
    type: 'warehouse',
    data: {
      label: 'Data Layer Warehouse',
    },
    parentId: datalayer.id,
    extent: 'parent',
    draggable: false,
  }

  // Since we're going to pre-defined the edges for this flow, will need a reference to the nodes.
  const flow = CreateFlow(datalayer, '1', 24, 212)

  const nodes: AppNode[] = [
    source1,
    source2,
    destination1,
    destination2,
    datalayer,
    warehouse,
    ...Object.values(flow),
    ...Object.values(CreateFlow(datalayer, '2', 24, 64)),
    // Data Layer container sub-flow
  ] satisfies AppNode[]

  // The initial state of the graph.
  const edges: AppEdge[] = [
    { id: 'pull-1', source: source1.id, target: flow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' } },
    { id: 'flow-1', source: flow.modelize.id, target: flow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' } },
    { id: 'push-1', source: flow.egress.id, target: destination1.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' } },
    { id: 'warehouse-1', source: flow.modelize.id, target: warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' } },

  ] satisfies AppEdge[]

  const layout: Layout = {
    nodes,
    edges,
  } satisfies Layout

  return layout
}

export const DefaultDefinition : LayoutDefinition = {
  name: '(Default)',
  builder: builder,

} satisfies LayoutDefinition
