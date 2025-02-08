import type { Edge, EdgeProps } from '@xyflow/react'

import { Status } from '@/types/status'

import { BaseEdge, getSmoothStepPath } from '@xyflow/react'

export type DataEdge = Edge<
  {
    status?: Status
    shape?: 'circle' | 'square' | 'triangle'
  },
  'data'
>

export function DataEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<DataEdge>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const color = '#31c787'
  const size = 6

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      {(data?.status === Status.Success || data?.status === Status.SuccessWithWarehouse)
      && (
        <>
          {data?.shape === 'circle' && (
            <circle r={size / 2} fill={color} className="react-flow__edge-data__gizmo">
              <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
            </circle>
          )}
          {data?.shape === 'square' && (
            <rect width={size} height={size} x={-size / 2} y={-size / 2} fill={color} className="react-flow__edge-data__gizmo">
              <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
            </rect>
          )}
          {data?.shape === 'triangle' && (
            <polygon points={`0,${-size / 2} ${size / 2},${size / 2} ${-size / 2},${size / 2}`} fill={color} className="react-flow__edge-data__gizmo">
              <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
            </polygon>
          )}
        </>
      )}
    </>
  )
}
