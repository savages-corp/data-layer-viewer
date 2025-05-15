import type { Node, NodeProps } from '@xyflow/react'

/*
  ContainerNode displays a label and has no other functionality. It is used to group other nodes with some visual representation.
*/

export type ContainerNode = Node<
  {
    color?: string
    textColor?: string
    annotation?: string
    annotationAlignment?: 'left' | 'center' | 'right'
    annotationSide?: 'top' | 'bottom'
    annotationSize?: 1 | 2 | 3 | 4 | 5
    label?: string
    labelSize?: 1 | 2 | 3 | 4 | 5
    labelPosition?: 'top' | 'bottom' | 'left' | 'right'
    outlineStyle?: 'solid' | 'dashed' | 'dotted'
  },
  'container'
>

export function ContainerNodeComponent({ data }: NodeProps<ContainerNode>) {
  const containerStyle = {
    background: data.color && `linear-gradient(48deg, ${data.color}, ${data.color}, #f8f8f8,  #ffffff)`,
    color: data.textColor ?? data.color,
    outlineColor: data.color,
    outlineStyle: data.outlineStyle,
    position: 'relative', // added to position annotation relative to container
  } satisfies React.CSSProperties

  let annotationAlignmentStyle: React.CSSProperties
  if (data.annotationAlignment === 'center') {
    annotationAlignmentStyle = { left: '50%', transform: 'translateX(-50%)' }
  }
  else if (data.annotationAlignment === 'right') {
    annotationAlignmentStyle = { right: 0 }
  }
  else {
    annotationAlignmentStyle = { left: 0 }
  }

  const annotationStyle: React.CSSProperties = {
    position: 'absolute',
    fontSize: data.annotationSize && `${data.annotationSize * 0.25}em`,
    ...(data.annotationSide === 'bottom'
      ? { top: '100%' } // place annotation below container
      : { bottom: '100%' }), // default/if 'top', place annotation above container
    ...annotationAlignmentStyle,
  } satisfies React.CSSProperties

  const labelStyle = {
    fontSize: data.labelSize && `${data.labelSize * 0.25}em`,
  } satisfies React.CSSProperties

  return (
    <div className="react-flow__node-container-contents" style={containerStyle}>
      {data.annotation && (
        <div className="react-flow__node-container-contents-annotation" style={annotationStyle}>{data.annotation}</div>
      )}
      {data.label && (
        <div className="react-flow__node-container-contents-label" style={labelStyle}>{data.label}</div>
      )}
    </div>
  )
}
