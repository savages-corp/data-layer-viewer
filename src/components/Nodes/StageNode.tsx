import type { Node, NodeProps } from '@xyflow/react'
import type { ServiceNode } from './ServiceNode'

import { Stage } from '@/types/stage'
import { Status } from '@/types/status'
import { Handle, Position, useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react'
import { useEffect } from 'react'

export type StageNode = Node<
  {
    stage: Stage
    partnerId: string
    status?: Status
  },
  'stage'
>

/*
  StageNode displays and connects data handling steps within the Data Layer.
    - It consists of two types: Modelize and Egress.
    - Modelize accepts connections only from a single Service nodes.
    - Egress sends data to a Service node.

*/

export function StageNodeComponent({ id, data }: NodeProps<StageNode>) {
  const { updateNodeData } = useReactFlow() // Update the status of the node.

  // Get the connections to the node.
  const sourceConnections = useNodeConnections({ handleType: 'source' })
  const targetConnections = useNodeConnections({ handleType: 'target' })

  // Get the data of the connected node.
  const targetConnectionsData = useNodesData(targetConnections[0]?.source) as ServiceNode | StageNode | undefined

  // Update the status of the node based on the connected node.
  useEffect(() => {
    if (targetConnections.length > 0) {
      if (targetConnectionsData?.data.status) {
        updateNodeData(id, { status: targetConnectionsData.data.status })
        return
      }
    }

    updateNodeData(id, { status: Status.Unknown })
  }, [targetConnectionsData])

  return (
    <div className={`react-flow__node-stage-contents react-flow__node-stage-contents-${data.stage.toLowerCase()}-${data.status && String(data.status).toLowerCase().replace(/_/g, '-')}`}>
      <div>{data.stage}</div>
      {/* Depending on whether the stage is modelize or egress, either the target or source is square */}
      <Handle
        type="target"
        position={Position.Left}
        id="push"
        style={{ borderRadius: data.stage === Stage.Egress ? '0' : '50%' }}
        isConnectable={targetConnections.length === 0}
        className={targetConnections.length > 0 ? 'react-flow__handle-plugged' : ''}
      >
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="pull"
        style={{ borderRadius: data.stage === Stage.Modelize ? '0' : '50%' }}
        isConnectable={sourceConnections.length === 0 || data.stage === Stage.Modelize && sourceConnections.length <= 1}
        className={(sourceConnections.length > 0 && data.stage === Stage.Egress) || sourceConnections.length > 1 ? 'react-flow__handle-plugged' : ''}
      >
      </Handle>
    </div>
  )
}
