import type { Connection, NodeProps } from '@xyflow/react'

import type { ServiceNode } from './'

import { Handle, Position } from '@xyflow/react'
import { useState } from 'react'

export function ServiceNodeComponent({ data }: NodeProps<ServiceNode>) {
  const [isSource, setIsSource] = useState(false)
  const [isDestination, setIsDestination] = useState(false)

  return (
    <div className="react-flow__node-default">
      <div>{data.label}</div>
      { (isSource || isDestination) && <div style={{ fontSize: 8, marginTop: 4, marginBottom: 4 }}>Connected</div> }
      <Handle
        type="target"
        position={Position.Left}
        id="push"
        style={{ visibility: isSource ? 'hidden' : 'visible' }}
        onConnect={(connection: Connection) => { connection.source !== connection.target && setIsDestination(true) }}
      >
        <div style={{ fontSize: 8, marginLeft: 12, lineHeight: 0.5 }}>Push</div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="pull"
        style={{ visibility: isDestination ? 'hidden' : 'visible' }}
        onConnect={(connection: Connection) => { setIsSource(connection !== null) }}
      >
        <div style={{ fontSize: 8, marginLeft: -30, lineHeight: 0.5 }}>Pull</div>
      </Handle>
    </div>
  )
}
