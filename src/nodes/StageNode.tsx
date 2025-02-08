import type { Status } from '@/types/status'
import type { Node, NodeProps } from '@xyflow/react'

import { Handle, Position } from '@xyflow/react'

export type StageNode = Node<
  {
    status?: Status
    label?: string
  },
  'stage'
>

/*
  StageNode displays and connects data handling steps within the Data Layer.
    - It consists of two types: Modelize and Egress.
    - Modelize accepts connections only from a single Service nodes.
    - Egress sends data to a Service node.

*/

export function StageNodeComponent({ data }: NodeProps<StageNode>) {
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
