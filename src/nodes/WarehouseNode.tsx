import type { Node, NodeProps } from '@xyflow/react'

import { Handle, Position } from '@xyflow/react'

export type WarehouseNode = Node<
  {
    label?: string
  },
  'warehouse'
>

/*
  WarehouseNode is a general receiver node for all modelized data.
*/

export function WarehouseNodeComponent({ data }: NodeProps<WarehouseNode>) {
  return (
    <>
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id="push"
      />
    </>
  )
}
