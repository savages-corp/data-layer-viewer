import type { NodeProps } from '@xyflow/react'

import type { ServiceNode } from './'

import { Handle, Position, useNodeConnections } from '@xyflow/react'
import { useEffect, useState } from 'react'

/*
  ServiceNodeComponent is a React component that renders a service node.
    - It displays the label of the service and two handles, one for pushing data and one for pulling data.
    - The handles are only visible if the node is not already connected to another node.
    - A service node handle can only be connected to one other node.

*/

export function ServiceNodeComponent({ data }: NodeProps<ServiceNode>) {
  const pushConnections = useNodeConnections({
    handleType: 'target',
  })

  const pullConnections = useNodeConnections({
    handleType: 'source',
  })

  const [isSource, setIsSource] = useState(false)
  const [isDestination, setIsDestination] = useState(false)

  useEffect(() => {
    if (pushConnections.length > 0) {
      setIsDestination(true)
      return
    }

    setIsDestination(false)
  }, [pushConnections])

  useEffect(() => {
    if (pullConnections.length > 0) {
      setIsSource(true)
      return
    }

    setIsSource(false)
  }, [pullConnections])

  return (
    <div className="react-flow__node-default">
      <div>{data.label}</div>
      { (isSource) && <div style={{ fontSize: 8, marginTop: 4, marginBottom: 4 }}>Source</div> }
      { (isDestination) && <div style={{ fontSize: 8, marginTop: 4, marginBottom: 4 }}>Destination</div> }
      <Handle
        type="target"
        position={Position.Left}
        id="push"
        style={{ visibility: isSource ? 'hidden' : 'visible'}}
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
