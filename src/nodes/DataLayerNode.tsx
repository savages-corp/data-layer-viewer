import type { NodeProps } from '@xyflow/react'

import type { DataLayerNode } from './'

import { Handle, Position } from '@xyflow/react'

/*
  DataLayerNode is a React component that renders a Data Layer internal node.
    - It consists of two types: Modelize and Egress.
    - Modelize accepts connections only from a single Service nodes.
    - Egress sends data to a Service node.

*/

export function DataLayerNodeComponent({ data }: NodeProps<DataLayerNode>) {
  return (
    <>
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Left}
        id="push"
      >
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="pull"
      >
      </Handle>
    </>
  )
}
