import type { NodeProps } from '@xyflow/react'

import type { ServiceNode } from './'

import { Handle, Position } from '@xyflow/react'

export function ServiceNodeComponent({ data }: NodeProps<ServiceNode>) {
  return (
    <div className="react-flow__node-default">
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Left}
        id="push"
      >
        <div style={{ fontSize: 8, marginLeft: 12, lineHeight: 0.5 }}>Push</div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="pull"
      >
        <div style={{ fontSize: 8, marginLeft: -30, lineHeight: 0.5 }}>Pull</div>
      </Handle>
    </div>
  )
}
