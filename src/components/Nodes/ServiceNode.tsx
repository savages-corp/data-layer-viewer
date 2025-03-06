import type { ServiceConfiguration } from '@/types/service'
import type { Node, NodeProps } from '@xyflow/react'
import type { StageNode } from './StageNode'

import { ServiceEditModal } from '@/components/App/ServiceEditModal'
import { Icon } from '@/components/Common/Icon'
import { useTi18n } from '@/components/Core/Ti18nProvider'
import { Status } from '@/types/status'

import { Handle, Position, useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react'
import { useEffect, useMemo, useState } from 'react'

export type ServiceNode = Node<
  {
    status?: Status
    interval?: number
    warehouse?: string
    configuration: ServiceConfiguration
  },
  'service'
>

export function ServiceNodeComponent({ id, data }: NodeProps<ServiceNode>) {
  const ti18n = useTi18n()
  const { setNodes, setEdges, updateNodeData } = useReactFlow()

  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!data.interval || data.interval < 0) {
    data.interval = 15
  }

  if (data.status === undefined) {
    data.status = Status.Unset
  }

  const targetConnections = useNodeConnections({
    handleType: 'target',
  })

  const sourceConnections = useNodeConnections({
    handleType: 'source',
  })

  const targetConnectionsData = useNodesData(targetConnections[0]?.source) as ServiceNode | StageNode | undefined

  const [isSource, setIsSource] = useState(false)
  const [isDestination, setIsDestination] = useState(false)

  const statusSlug = useMemo(() => {
    if (data.status) {
      return String(data.status).toLowerCase().replace(/_/g, '-')
    }
  }, [data])

  useEffect(() => {
    if (targetConnections.length > 0) {
      setIsDestination(true)

      if (targetConnectionsData?.data.status) {
        updateNodeData(id, { status: targetConnectionsData.data.status })
        return
      }

      return
    }

    setIsDestination(false)
  }, [targetConnectionsData])

  useEffect(() => {
    if (sourceConnections.length > 0) {
      setIsSource(true)
      return
    }

    setIsSource(false)
  }, [sourceConnections])

  const handleDelete = () => {
    setNodes(nodes => nodes.filter(node => node.id !== id && node.parentId !== id))
    setEdges(edges => edges.filter(edge => edge.source !== id && edge.target !== id))

    if (isSource && targetConnectionsData) {
      updateNodeData(targetConnectionsData.id, { status: Status.Unset })
    }

    setIsModalOpen(false)
  }

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { configuration: { ...data.configuration, identifier: event.target.value } })
  }

  return (
    <>
      <ServiceEditModal
        id={id}
        data={data}
        isSource={isSource}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onDelete={handleDelete}
      />

      {/* Node UI */}
      <div className={`react-flow__node-service-contents react-flow__node-service-contents-${isSource ? 'source' : ''}${isDestination ? 'destination' : ''}-${statusSlug} service-node-status-${statusSlug}`}>
        <div className="react-flow__node-service-icon">
          <Icon size={16} icon={data.configuration?.type} />
        </div>

        {/* Action buttons - visible on hover and when selected */}
        <div className="react-flow__node-service-action-buttons">
          <div className="react-flow__node-service-action-button" onClick={handleDelete}>
            <Icon
              className="react-flow__node-service-action-button-destructive"
              icon="trash"
              size={10}
            />
          </div>
          <div className="react-flow__node-service-action-button" onClick={() => setIsModalOpen(true)}>
            <Icon
              icon="gear"
              size={10}
              className="react-flow__node-service-action-button-gear"
            />
          </div>
        </div>

        <div className="react-flow__node-service-information">
          <div className="react-flow__node-service-title">
            <input value={data.configuration.identifier} maxLength={24} onChange={handleLabelChange} />
          </div>
          { (isSource) && <span className="react-flow__node-service-subtitle">{ti18n.translate(ti18n.keys.serviceLabelSource)}</span> }
          { (isDestination) && <span className="react-flow__node-service-subtitle">{ti18n.translate(ti18n.keys.serviceLabelDestination)}</span> }
        </div>

        <Handle
          type="target"
          position={Position.Left}
          id="push"
          style={{ visibility: isSource ? 'hidden' : 'visible' }}
          isConnectable={!isDestination}
          className={isDestination ? 'react-flow__handle-plugged' : ''}
        >
          <div className="react-flow__node-service-handle-annotation-push">{ti18n.translate(ti18n.keys.serviceLabelPush)}</div>
        </Handle>
        <Handle
          type="source"
          position={Position.Right}
          id="pull"
          style={{ visibility: isDestination ? 'hidden' : 'visible' }}
          isConnectable={!isSource}
          className={isSource ? 'react-flow__handle-plugged' : ''}
        >
          <div className="react-flow__node-service-handle-annotation-pull">{ti18n.translate(ti18n.keys.serviceLabelPull)}</div>
        </Handle>
      </div>
    </>
  )
}
