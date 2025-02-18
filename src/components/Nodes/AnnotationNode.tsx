import type { Node, NodeProps } from '@xyflow/react'

import React from 'react'
import { Icon } from '../Common/Icon'

export type AnnotationNode = Node<
  {
    text: string
    textAlignment?: 'left' | 'center' | 'right'
    showArrow?: boolean
    arrowPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    isPinned?: boolean
    pinnedPosition?: 'top-left' | 'top-right'
  },
  'annotation'
>

export function AnnotationNodeComponent({ data }: NodeProps<AnnotationNode>) {
  const lines = data.text.split('\n')
  return (
    <>
      <div
        className={`react-flow__node-annotation-text ${data.isPinned ? 'pinned' : ''}`}
        style={{ textAlign: data.textAlignment || 'left' }}
      >
        {lines.map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            {idx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
      {data.showArrow && (
        <div className={`react-flow__node-annotation-arrow react-flow__node-annotation-arrow-${data.arrowPosition || 'right'}`}>
          <Icon variant="arrowCurved" size={16} />
        </div>
      )}
    </>
  )
}
