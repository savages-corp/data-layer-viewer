import type { Service } from '@/types/service'
import type { Node, NodeProps } from '@xyflow/react'
import type { StageNode } from './StageNode'
import { Status } from '@/types/status'

import { Handle, Position, useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react'

import { useEffect, useState } from 'react'

import Select from 'react-select'

import { Icon } from '../Common/Icon'

/*
  ServiceNode displays various services that can be connected to other nodes.
    - It displays the label of the service and two handles, one for pushing data and one for pulling data.
    - The handles are only visible if the node is not already connected to another node.
    - A service node handle can only be connected to one other node.
*/

export type ServiceNode = Node<
  {
    color?: string
    status?: Status
    label?: string
    service: Service
  },
  'service'
>

export interface StatusOption {
  value: Status
  label: string
}

export const statusOptions: StatusOption[] = [
  { value: Status.Success, label: 'Success' },
  { value: Status.SuccessNothingNew, label: 'Success Nothing New' },
  { value: Status.ErrorServicePull, label: 'Error Service Pull' },
  { value: Status.ErrorDataEgress, label: 'Error Data Egress' },
  { value: Status.ErrorDataModelize, label: 'Error Data Modelize' },
  { value: Status.ErrorServicePush, label: 'Error Service Push' },
  { value: Status.Unknown, label: 'Inactive' },
]

export function ServiceNodeComponent({ id, data }: NodeProps<ServiceNode>) {
  const [label, setLabel] = useState(data.label)
  const { updateNodeData, setNodes, setEdges } = useReactFlow()

  if (data.status === undefined) {
    data.status = Status.Unknown
  }

  const targetConnections = useNodeConnections({
    handleType: 'target',
  })

  const sourceConnections = useNodeConnections({
    handleType: 'source',
  })

  // Get the data of the connected node.
  const targetConnectionsData = useNodesData(targetConnections[0]?.source) as ServiceNode | StageNode | undefined

  const [isSource, setIsSource] = useState(false)
  const [isDestination, setIsDestination] = useState(false)

  // Switch the visibility of the handles based on the connections. Also, update the status of the node based on the connected node if we're not the source node.
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

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value)
    updateNodeData(id, { label: event.target.value })
  }

  const handleDelete = () => {
    // Remove the node from the nodes array.
    setNodes(nodes => nodes.filter(node => node.id !== id))

    // Remove the edges connected to the node.
    setEdges(edges => edges.filter(edge => edge.source !== id && edge.target !== id))

    // Update the connected node if we're the source node.
    if (isSource && targetConnectionsData) {
      updateNodeData(targetConnectionsData.id, { status: Status.Unknown })
    }
  }

  return (
    <div className={`react-flow__node-service-contents react-flow__node-service-contents-${isSource ? 'source' : ''}${isDestination ? 'destination' : ''}-${data.status && String(data.status).toLowerCase().replace(/_/g, '-')}`}>
      <div className="react-flow__node-service-icon">
        <Icon size={16} variant={data.service} color={data.color} />
      </div>
      <div className="react-flow__node-service-icon-delete">
        <Icon onClick={handleDelete} size={16} variant="trash" color={data.color} />
      </div>
      <div className="react-flow__node-service-information">
        <div className="react-flow__node-service-title">
          <input value={label} maxLength={24} onChange={handleLabelChange} />
        </div>
        { (isSource) && <span className="react-flow__node-service-subtitle">Source</span> }
        { (isDestination) && <span className="react-flow__node-service-subtitle">Destination</span> }
      </div>
      { isSource && (

        <div className="react-flow__node-service-status-select nodrag">
          <Select
            value={statusOptions.find(option => option.value === data.status)}
            onChange={option => updateNodeData(id, { status: option?.value })}
            menuPortalTarget={document.body}
            styles={{ menuPortal: base => ({ ...base, zIndex: 9999, fontSize: '.75em' }) }}
            options={statusOptions}
          >
          </Select>
        </div>
      )}
      <Handle
        type="target"
        position={Position.Left}
        id="push"
        style={{ visibility: isSource ? 'hidden' : 'visible' }}
        // isConnectable={!isDestination}
      >
        <div style={{ fontSize: 8, marginLeft: 12, lineHeight: 0.5 }}>Push</div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="pull"
        style={{ visibility: isDestination ? 'hidden' : 'visible' }}
        isConnectable={!isSource}
        className={isSource ? 'react-flow__handle-plugged' : ''}
      >
        <div style={{ fontSize: 8, marginLeft: -30, lineHeight: 0.5 }}>Pull</div>
      </Handle>
    </div>
  )
}
