import type { Node, NodeProps } from '@xyflow/react'

import { Handle, Position, useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react'

import { useEffect, useMemo } from 'react'
import { useTi18n } from '@/components/Core/Ti18nProvider'

import { Stage, StageLayer } from '@/types/stage'
import { Status } from '@/types/status'

export type StageNode = Node<
  {
    stage: Stage
    partnerId: string
    status?: Status
  },
  'stage'
>

/*
  StageNode displays and connects data handling steps within the Data Layer. Each stage belongs to one medallion layer:
    - Ingest (Bronze) accepts a connection from a single Service node and lands the raw data.
    - Modelize (Silver) conforms the raw data and may additionally persist it to the Warehouse.
    - Egress (Gold) sends the curated data to a Service node.

  Round handles connect to services, square handles connect stages (and the warehouse) inside the Data Layer.
*/

export function StageNodeComponent({ id, data }: NodeProps<StageNode>) {
  const ti18n = useTi18n() // Get the translation function.

  const { updateNodeData } = useReactFlow() // Update the status of the node.

  // Get the connections to the node.
  const sourceConnections = useNodeConnections({ handleType: 'source' })
  const targetConnections = useNodeConnections({ handleType: 'target' })

  // Get the data of the connected node.
  const targetConnectionsData = useNodesData(targetConnections[0]?.source)

  const statusSlug = useMemo(() => {
    if (data.status) {
      return String(data.status).toLowerCase().replace(/_/g, '-')
    }
  }, [data, data.status])

  // Update the status of the node based on the connected node.
  useEffect(() => {
    if (targetConnections.length > 0) {
      if (targetConnectionsData?.data.status) {
        updateNodeData(id, { status: targetConnectionsData.data.status })
        return
      }
    }

    updateNodeData(id, { status: Status.Unset })
  }, [targetConnectionsData, targetConnectionsData?.data.status])

  const label = useMemo(() => {
    switch (data.stage) {
      case Stage.Ingest:
        return ti18n.translate(ti18n.keys.stageIngest)

      case Stage.Modelize:
        return ti18n.translate(ti18n.keys.stageModelize)

      case Stage.Egress:
        return ti18n.translate(ti18n.keys.stageEgress)
    }
  }, [data.stage])

  const stageSlug = data.stage.toLowerCase()
  const layerSlug = StageLayer[data.stage].toLowerCase()

  // Ingest receives from a service (round), every other stage receives from a stage (square).
  const targetIsRound = data.stage === Stage.Ingest
  // Egress sends to a service (round), every other stage sends to a stage or the warehouse (square).
  const sourceIsRound = data.stage === Stage.Egress
  // Modelize may fan out to its partner stage and the warehouse, all other stages have a single outgoing connection.
  const maxSourceConnections = data.stage === Stage.Modelize ? 2 : 1

  return (
    <div className={`react-flow__node-stage-contents react-flow__node-stage-contents-${layerSlug} react-flow__node-stage-contents-${stageSlug}-${statusSlug} stage-node-status-${statusSlug}`}>
      <div>{label}</div>
      <Handle
        type="target"
        position={Position.Left}
        id="push"
        style={{ borderRadius: targetIsRound ? '50%' : '0' }}
        isConnectable={targetConnections.length === 0}
        className={targetConnections.length > 0 ? 'react-flow__handle-plugged' : ''}
      >
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="pull"
        style={{ borderRadius: sourceIsRound ? '50%' : '0' }}
        isConnectable={sourceConnections.length < maxSourceConnections}
        className={sourceConnections.length >= maxSourceConnections ? 'react-flow__handle-plugged' : ''}
      >
      </Handle>
    </div>
  )
}
