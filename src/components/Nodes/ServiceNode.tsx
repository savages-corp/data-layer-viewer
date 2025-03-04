import type { ServiceConfiguration } from '@/types/service'
import type { Node, NodeProps } from '@xyflow/react'
import type { StageNode } from './StageNode'

import { createStatusOptions, getStatusColor, StatusOptionComponent } from '@/components/App/StatusUtility'
import { Button } from '@/components/Common/Button'
import { Icon } from '@/components/Common/Icon'

import { Modal } from '@/components/Common/Modal'

import { useTi18n } from '@/components/Core/Ti18nProvider'
import { Status } from '@/types/status'

import { Handle, Position, useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react'
import { useEffect, useState } from 'react'
import Select from 'react-select'

/*
  ServiceNode displays various services that can be connected to other nodes.
    - It displays the label of the service and two handles, one for pushing data and one for pulling data.
    - The handles are only visible if the node is not already connected to another node.
    - A service node handle can only be connected to one other node.
*/

export type ServiceNode = Node<
  {
    status?: Status

    // Flow specific properties
    interval?: number
    warehouse?: string

    // Service specific configuration
    configuration: ServiceConfiguration
  },
  'service'
>

export function ServiceNodeComponent({ id, data }: NodeProps<ServiceNode>) {
  const ti18n = useTi18n() // Get the translation function.

  const { updateNodeData, setNodes, setEdges } = useReactFlow()

  // State for managing the edit modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!data.interval || data.interval < 0) {
    data.interval = 15
  }

  // Get status options from the utility
  const statusOptions = createStatusOptions(ti18n)

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
    updateNodeData(id, { configuration: { ...data.configuration, identifier: event.target.value } })
  }

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10) || 0
    updateNodeData(id, { interval: value })
  }

  // Function to handle parameter changes
  const handleParameterChange = (key: string, value: any) => {
    const updatedParameters = {
      ...data.configuration.parameters || {},
      [key]: value,
    }

    updateNodeData(id, {
      configuration: {
        ...data.configuration,
        parameters: updatedParameters,
      },
    })
  }

  // Helper function to render the appropriate input field based on parameter type
  const renderParameterInput = (key: string, value: any) => {
    const type = typeof value

    switch (type) {
      case 'boolean':
        return (
          <div className="react-flow__node-service-form-field" key={key}>
            <div className="react-flow__node-service-form-checkbox">
              <input
                type="checkbox"
                checked={value}
                onChange={e => handleParameterChange(key, e.target.checked)}
                id={`param-${key}`}
              />
              <label htmlFor={`param-${key}`}>{key}</label>
            </div>
          </div>
        )

      case 'number':
        return (
          <div className="react-flow__node-service-form-field" key={key}>
            <h5>{key}</h5>
            <input
              type="number"
              value={value}
              onChange={e => handleParameterChange(key, Number(e.target.value))}
            />
          </div>
        )

      default:
        return (
          <div className="react-flow__node-service-form-field" key={key}>
            <h5>{key}</h5>
            <input
              type="text"
              value={value}
              onChange={e => handleParameterChange(key, e.target.value)}
            />
          </div>
        )
    }
  }

  const handleDelete = () => {
    // Remove the node from the nodes array. Remove any nodes that have it as a parent.
    setNodes(nodes => nodes.filter(node => node.id !== id && node.parentId !== id))

    // Remove the edges connected to the node.
    setEdges(edges => edges.filter(edge => edge.source !== id && edge.target !== id))

    // Update the connected node if we're the source node.
    if (isSource && targetConnectionsData) {
      updateNodeData(targetConnectionsData.id, { status: Status.Unknown })
    }

    // Close modal if open
    setIsModalOpen(false)
  }

  return (
    <>
      {/* Edit Modal */}
      <Modal
        title={`${ti18n.translate(ti18n.keys.genericEditService)}`}
        subtitle={(
          <div className="react-flow__node-service-form-row">
            <Icon icon={data.configuration.type} size={16} />
            <span>{data.configuration.type}</span>
          </div>
        )}
        buttons={(
          <Button
            onClick={handleDelete}
            className="button-destructive"
            style={{ width: 'fit-content' }}
          >
            <Icon icon="trash" size={16} />
            {ti18n.translate(ti18n.keys.genericDelete)}
          </Button>
        )}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="react-flow__node-service-form">
          <div className="react-flow__node-service-form-common">
            <div className="react-flow__node-service-form-field">
              <h3>{ti18n.translate(ti18n.keys.genericIdentifier)}</h3>
              <input
                type="text"
                value={data.configuration.identifier}
                onChange={handleLabelChange}
              />
            </div>

            {isSource && (
              <div className="react-flow__node-service-form-field">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ti18n.translate(ti18n.keys.genericStatus)}
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(data.status || Status.Unknown),
                      display: 'inline-block',
                    }}
                  />
                </h3>
                <Select
                  value={statusOptions.find(option => option.value === data.status)}
                  onChange={option => updateNodeData(id, { status: option?.value })}
                  options={statusOptions}
                  components={{
                    Option: StatusOptionComponent,
                  }}
                  styles={{
                    option: baseStyles => ({
                      ...baseStyles,
                      padding: 0,
                    }),
                  }}
                />
              </div>
            )}
          </div>

          <div className="react-flow__node-service-form-field">
            <h3>{ti18n.translate(ti18n.keys.genericInterval)}</h3>
            <div className="react-flow__node-service-form-row">
              <input
                type="number"
                min="0"
                value={data.interval || 0}
                onChange={handleIntervalChange}
                style={{ width: '80px' }}
              />
              <span>{ti18n.translate(ti18n.keys.genericMinutes)}</span>
            </div>
          </div>

          {/* Parameters section */}
          {data.configuration.parameters && Object.keys(data.configuration.parameters).length > 0 && (
            <div className="react-flow__node-service-form-field">
              <h3 className="react-flow__node-service-form-section">{ti18n.translate(ti18n.keys.genericParameters) || 'Parameters'}</h3>
              <div className="react-flow__node-service-form-parameters">
                {Object.entries(data.configuration.parameters).map(([key, value]) =>
                  renderParameterInput(key, value),
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Node UI */}
      <div className={`react-flow__node-service-contents react-flow__node-service-contents-${isSource ? 'source' : ''}${isDestination ? 'destination' : ''}-${data.status && String(data.status).toLowerCase().replace(/_/g, '-')}`}>
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
          <div style={{ fontSize: 8, marginLeft: 12, lineHeight: 0.5 }}>{ti18n.translate(ti18n.keys.serviceLabelPush)}</div>
        </Handle>
        <Handle
          type="source"
          position={Position.Right}
          id="pull"
          style={{ visibility: isDestination ? 'hidden' : 'visible' }}
          isConnectable={!isSource}
          className={isSource ? 'react-flow__handle-plugged' : ''}
        >
          <div style={{ fontSize: 8, marginLeft: -30, lineHeight: 0.5 }}>{ti18n.translate(ti18n.keys.serviceLabelPull)}</div>
        </Handle>
      </div>
    </>
  )
}
