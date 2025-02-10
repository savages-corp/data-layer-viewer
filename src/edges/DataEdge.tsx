import type { Edge, EdgeProps } from '@xyflow/react'

import type { ServiceNode } from 'src/nodes/ServiceNode'

import { Status } from '@/types/status'
import { BaseEdge, getSmoothStepPath, useNodesData } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type DataEdge = Edge<
  {
    shape?: 'circle' | 'square' | 'triangle'
  },
  'data'
>

export function DataEdgeComponent({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<DataEdge>) {
  const [status, setStatus] = useState<Status>(Status.Unknown) // Keep track of the status of the edge.
  const sourceNode = useNodesData(source) // Get the data of the source node for the edge.

  useEffect(() => { // Receive status from source node.
    if (sourceNode?.type === 'service' || sourceNode?.type === 'stage') {
      const serviceNode = sourceNode as ServiceNode

      setStatus(serviceNode.data.status ?? Status.Unknown)
    }
  }, [sourceNode])

  // Get the color of the edge based on the status. We'll wrap this in a useCallback to prevent unnecessary re-renders.
  const color = useMemo(() => {
    switch (status) {
      case Status.Success:
      case Status.SuccessWithWarehouse:
      case Status.SuccessNothingNew:
        return 'var(--xy-edge-stroke-default)'
      case Status.ErrorServicePull:
      case Status.ErrorServicePush:
      case Status.ErrorDataModelize:
      case Status.ErrorDataEgress:
      case Status.ErrorInternalUnknown:
        return '#ff7090'
      default:
        return '#ccc'
    }
  }, [status])

  // Edge specific styling properties. First we'll determine if the edge is active.
  const isActive = (status === Status.Success || status === Status.SuccessWithWarehouse || status === Status.SuccessNothingNew)
  const size = 6 // Size of the gizmo.
  const dashes = isActive ? '5' : '0' // Dashed line for active edges.
  const style = {
    animation: `dashdraw 0.25s linear infinite ${(!isActive && status !== Status.Unknown) ? ', blink 1s infinite' : ''}`,
    stroke: color,
  } satisfies React.CSSProperties

  // Compute the path of the edge.
  const getPath = useCallback(() => {
    return getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })[0]
  }, [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition])

  return (
    <>
      <BaseEdge id={id} path={getPath()} strokeDasharray={dashes} style={style} />
      {(status === Status.Success || status === Status.SuccessWithWarehouse)
      && (
        <>
          {data?.shape === 'circle' && (
            <circle r={size / 2} fill={color} className="react-flow__edge-data__gizmo">
              <animateMotion dur="2s" repeatCount="indefinite" path={getPath()} />
            </circle>
          )}
          {data?.shape === 'square' && (
            <rect width={size} height={size} x={-size / 2} y={-size / 2} fill={color} className="react-flow__edge-data__gizmo">
              <animateMotion dur="2s" repeatCount="indefinite" path={getPath()} />
            </rect>
          )}
          {data?.shape === 'triangle' && (
            <polygon points={`0,${-size / 2} ${size / 2},${size / 2} ${-size / 2},${size / 2}`} fill={color} className="react-flow__edge-data__gizmo">
              <animateMotion dur="2s" repeatCount="indefinite" path={getPath()} />
            </polygon>
          )}
        </>
      )}
    </>
  )
}
