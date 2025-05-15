import type { ServiceNode } from '@/components/Nodes/ServiceNode'

import { createStatusOptions, getStatusColor, StatusOption } from '@/components/App/StatusOption'
import { Button } from '@/components/Common/Button'
import { Icon } from '@/components/Common/Icon'
import { Modal } from '@/components/Common/Modal'
import { useTi18n } from '@/components/Core/Ti18nProvider'
import { Status } from '@/types/status'

import { useReactFlow } from '@xyflow/react'
import Select from 'react-select'

export function ServiceEditModal(
  {
    id,
    data,
    isSource,
    isOpen,
    setIsOpen,
    onDelete,
  }: {
    readonly id: string
    readonly data: ServiceNode['data']
    readonly isSource: boolean
    readonly isOpen: boolean
    readonly setIsOpen: (value: boolean) => void
    readonly onDelete: () => void
  },
) {
  const ti18n = useTi18n()
  const { updateNodeData } = useReactFlow()

  const statusOptions = createStatusOptions(ti18n)

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { configuration: { ...data.configuration, identifier: event.target.value } })
  }

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10) || 0
    updateNodeData(id, { interval: value })
  }

  const handleParameterChange = (key: string, value: any) => {
    const updatedParameters = {
      ...data.configuration.parameters ?? {},
      [key]: value,
    }

    updateNodeData(id, {
      configuration: {
        ...data.configuration,
        parameters: updatedParameters,
      },
    })
  }

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

  return (
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
          onClick={onDelete}
          className="button-destructive"
          style={{ width: 'fit-content' }}
        >
          <Icon icon="trash" size={16} />
          {ti18n.translate(ti18n.keys.genericDelete)}
        </Button>
      )}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={() => setIsOpen(false)}
    >
      <div className="react-flow__node-service-form">
        <div className="react-flow__node-service-form-group">
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
                    backgroundColor: getStatusColor(data.status ?? Status.Unset),
                    display: 'inline-block',
                  }}
                />
              </h3>
              <Select
                value={statusOptions.find(option => option.value === data.status)}
                onChange={option => updateNodeData(id, { status: option?.value })}
                options={statusOptions}
                components={{
                  Option: StatusOption,
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
              value={data.interval ?? 0}
              onChange={handleIntervalChange}
              style={{ width: '80px' }}
            />
            <span>{ti18n.translate(ti18n.keys.genericMinutes)}</span>
          </div>
        </div>

        {data.configuration.parameters && Object.keys(data.configuration.parameters).length > 0 && !data.imported && (
          <div className="react-flow__node-service-form-field">
            <h3 className="react-flow__node-service-form-section">{ti18n.translate(ti18n.keys.genericParameters) || 'Parameters'}</h3>
            <div className="react-flow__node-service-form-parameters">
              {Object.entries(data.configuration.parameters).map(([key, value]) =>
                renderParameterInput(key, value),
              )}
            </div>
          </div>
        )}

        {data.imported && (
          <div className="react-flow__node-service-form-field">
            <h3 className="react-flow__node-service-form-section">{ti18n.translate(ti18n.keys.genericParameters) || 'Parameters'}</h3>
            <div className="react-flow__node-service-form-parameters">
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                {ti18n.translate(ti18n.keys.serviceImportedMessage)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
