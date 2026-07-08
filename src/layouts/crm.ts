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

  const hubSpotSource: ServiceNode = {
    id: getTimedId('service-source-1'),
    type: 'service',
    position: { x: -312, y: -64 },
    data: {
      status: Status.Success,
      configuration: {
        identifier: 'Hubspot',
        type: ServiceType.CommonHubspot,
        parameters: {
          apiKey: '',
          portalId: '',
          oauthToken: '',
        },
      },
    },
  }

  const annotation1: AnnotationNode = {
    id: getTimedId('annotation-1'),
    type: 'annotation',
    position: { x: -80, y: -36 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationCrmHubspotSync),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'bottom-right',
    },
    parentId: hubSpotSource.id,
    draggable: false,
    selectable: false,
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

  const synchronizeFlow = CreateFlowPrefab(datalayer.container, '1', 24, calculateNextFlowY(0))

  const annotation2: AnnotationNode = {
    id: getTimedId('annotation-2'),
    type: 'annotation',
    position: { x: -240, y: -32 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationCrmTransform),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'bottom-right',
    },
    parentId: synchronizeFlow.egress.id,
    draggable: false,
    selectable: false,
  }

  // If we're not on mobile, add the second flow from Salesforce to warehouse
  const warehouseFlow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(1))
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

  const annotation3: AnnotationNode = {
    id: getTimedId('annotation-3'),
    type: 'annotation',
    position: { x: -72, y: 56 },
    width: 300,
    data: {
      text: ti18n.translate(ti18n.keys.annotationCrmWarehouse),
      textAlignment: 'right',
      showArrow: true,
      arrowPosition: 'top-right',
    },
    parentId: salesforceSource.id,
    draggable: false,
    selectable: false,
  }

  const nodes: AppNode[] = [
    ...Object.values(datalayer),
    hubSpotSource,
    salesforceSource,
    salesforceDestination,
    ...Object.values(synchronizeFlow),
    ...Object.values(warehouseFlow),
    annotation1,
    annotation2,
    annotation3,
  ] satisfies AppNode[]

  const edges: AppEdge[] = [
    { id: 'pull-modelize-1', source: hubSpotSource.id, target: synchronizeFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'modelize-egress-1', source: synchronizeFlow.modelize.id, target: synchronizeFlow.egress.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
    { id: 'egress-push-1', source: synchronizeFlow.egress.id, target: salesforceDestination.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'pull-modelize-2', source: salesforceSource.id, target: warehouseFlow.modelize.id, type: 'data', data: { initialStatus: Status.Success, shape: 'circle' }, zIndex: 1 },
    { id: 'warehouse-2', source: warehouseFlow.modelize.id, target: datalayer.warehouse.id, type: 'data', data: { initialStatus: Status.Success, shape: 'square' }, zIndex: 1 },
  ] satisfies AppEdge[]

  const flows = [synchronizeFlow, warehouseFlow] satisfies FlowPrefab[]
  const layout: Layout = {
    datalayer,
    nodes,
    edges,
    flows,
  } satisfies Layout

  return layout
}

export const CrmDefinition: LayoutDefinition = {
  name: ({ ti18n }) => ti18n.translate(ti18n.keys.layoutCrm),
  builder,
} satisfies LayoutDefinition
