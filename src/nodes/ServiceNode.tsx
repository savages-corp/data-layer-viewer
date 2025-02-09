import type { Status } from '@/types/status'
import type { Node, NodeProps } from '@xyflow/react'

import { Handle, Position, useNodeConnections } from '@xyflow/react'
import { useEffect, useState } from 'react'

/*
  ServiceNode displays various services that can be connected to other nodes.
    - It displays the label of the service and two handles, one for pushing data and one for pulling data.
    - The handles are only visible if the node is not already connected to another node.
    - A service node handle can only be connected to one other node.

*/

export type ServiceNode = Node<
  {
    status?: Status
    label?: string
  },
  'service'
>

export function ServiceNodeComponent({ data }: NodeProps<ServiceNode>) {
  const targetConnections = useNodeConnections({
    handleType: 'target',
  })

  const sourceConnections = useNodeConnections({
    handleType: 'source',
  })

  const [isSource, setIsSource] = useState(false)
  const [isDestination, setIsDestination] = useState(false)

  // Switch the visibility of the handles based on the connections.
  useEffect(() => {
    if (targetConnections.length > 0) {
      setIsDestination(true)
      return
    }

    setIsDestination(false)
  }, [targetConnections])

  useEffect(() => {
    if (sourceConnections.length > 0) {
      setIsSource(true)
      return
    }

    setIsSource(false)
  }, [sourceConnections])

  return (
    <div className="react-flow__node-default react-flow__node-service">
      <div>{data.label}</div>
      { (isSource) && <span className="react-flow__node-service-subtitle">Source</span> }
      { (isDestination) && <span className="react-flow__node-service-subtitle">Destination</span> }
      <Handle
        type="target"
        position={Position.Left}
        id="push"
        style={{ visibility: isSource ? 'hidden' : 'visible' }}
        isConnectable={!isDestination}
      >
        <div style={{ fontSize: 8, marginLeft: 12, lineHeight: 0.5 }}>Push</div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="pull"
        style={{ visibility: isDestination ? 'hidden' : 'visible' }}
        isConnectable={!isSource}
      >
        <div style={{ fontSize: 8, marginLeft: -30, lineHeight: 0.5 }}>Pull</div>
      </Handle>
    </div>
  )
}
