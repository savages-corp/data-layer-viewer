import type { EdgeProps } from '@xyflow/react'

import type { DataEdge } from './'

import { BaseEdge, getSmoothStepPath } from '@xyflow/react'

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
  )
}
