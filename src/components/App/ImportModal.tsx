import { Button, ButtonType } from '@/components/Common/Button'
import { Icon } from '@/components/Common/Icon'
import { Modal } from '@/components/Common/Modal'
import { useTi18n } from '@/components/Core/Ti18nProvider'

import { useState } from 'react'
import { parse as YAMLParse } from 'yaml'

interface ImportModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  onImport: (config: any) => void
}

export function ImportModal({ isOpen, setIsOpen, onImport }: ImportModalProps) {
  const ti18n = useTi18n()
  const [inputValue, setInputValue] = useState('')
  const [format, setFormat] = useState('json') // 'json' or 'yaml'
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleImport = () => {
    if (!inputValue.trim()) {
      setValidationError(ti18n.translate(ti18n.keys.importEmptyError) || 'Please enter a configuration')
      return
    }

    try {
      const parsedConfig = format === 'json'
        ? JSON.parse(inputValue)
        : YAMLParse(inputValue)

      // Basic validation to check if it has the expected structure
      if (!parsedConfig || typeof parsedConfig !== 'object') {
        setValidationError(ti18n.translate(ti18n.keys.importInvalidError) || 'Invalid configuration format')
        return
      }

      // If there are flows in the config, it should be in the right format
      if (Array.isArray(parsedConfig.flows)) {
        onImport(parsedConfig.flows)
      }
      else if (Array.isArray(parsedConfig)) {
        // If it's already an array of flows
        onImport(parsedConfig)
      }
      else {
        setValidationError(ti18n.translate(ti18n.keys.importMissingFlowsError) || 'Invalid configuration: missing flows')
        return
      }

      // Reset form on successful import
      setInputValue('')
      setValidationError(null)
      setIsOpen(false)
    }
    catch (error) {
      setValidationError(
        `${ti18n.translate(ti18n.keys.importParseError) || 'Failed to parse configuration'}: ${(error as Error).message}`,
      )
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setInputValue(clipboardText)
    }
    catch (error) {
      console.error('Failed to read from clipboard:', error)
      setValidationError(
        ti18n.translate(ti18n.keys.importClipboardError) || 'Failed to read from clipboard',
      )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={() => setIsOpen(false)}
      title={ti18n.translate(ti18n.keys.modalImportTitle) || 'Import Configuration'}
      buttons={(
        <>
          <Button onClick={handleImport} type={ButtonType.Primary}>
            {ti18n.translate(ti18n.keys.buttonImport) || 'Import'}
          </Button>
        </>
      )}
    >
      <div className="import-modal-content">
        <p>
          {ti18n.translate(ti18n.keys.modalImportDescription)
          || 'Paste in a configuration to import. The format should match the export format.'}
        </p>

        <div className="import-modal-format-selector">
          <label>
            {ti18n.translate(ti18n.keys.importFormat) || 'Format:'}
          </label>
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            className="import-format-select"
          >
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
          </select>
        </div>

        <div className="import-modal-textarea-container">
          <textarea
            className="import-modal-textarea"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={format === 'json'
              ? '{ "flows": [...] }'
              : 'flows:\n  - name: "Flow 1"\n    warehouse: true\n    ...'}
            rows={12}
          />

          <Button
            onClick={handlePasteFromClipboard}
            className="import-clipboard-button"
            type={ButtonType.Secondary}
          >
            <Icon icon="clipboard" size={14} />
            {ti18n.translate(ti18n.keys.importPasteClipboard) || 'Paste from Clipboard'}
          </Button>
        </div>

        {validationError && (
          <div className="import-validation-error">
            <Icon icon="exclamation" size={14} style={{ color: 'var(--viewer-button-destructive)' }} />
            {validationError}
          </div>
        )}
      </div>
    </Modal>
  )
}
