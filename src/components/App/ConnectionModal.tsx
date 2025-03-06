import type { AppEdge, AppNode } from '@/src/App'
import type { DatalayerPrefab } from '@/src/prefabs/datalayer'
import type { FlowPrefab } from '@/src/prefabs/flow'
import type { AuditDBPush } from '@/types/auditdb'
import type { WebClickHouseClient } from '@clickhouse/client-web/dist/client'

import { Button } from '@/components/Common/Button'
import { Icon } from '@/components/Common/Icon'
import { Modal } from '@/components/Common/Modal'

import { useTi18n } from '@/components/Core/Ti18nProvider'
import { createClient } from '@clickhouse/client-web'
import { useReactFlow } from '@xyflow/react'
import { useCallback, useEffect, useState } from 'react'
import { calculateExpectedDataEdges, translateFromAuditData, updateFromAuditData } from '../../helpers/db'

interface ConnectionModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  onVisualize: (datalayer: DatalayerPrefab, nodes: AppNode[], edges: AppEdge[], flows: FlowPrefab[]) => void
}

export function ConnectionModal({ isOpen, setIsOpen, onVisualize }: ConnectionModalProps) {
  const ti18n = useTi18n()

  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow()

  const [client, setClient] = useState<WebClickHouseClient | null>(null)

  const [host, setHost] = useState('')
  const [port, setPort] = useState('8123')
  const [secure, setSecure] = useState(false)
  const [username, setUsername] = useState('default')
  const [password, setPassword] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchAuditData = useCallback(async (client: WebClickHouseClient, isInitialFetch = false) => {
    try {
      const result = await client.query({
        query: `
          SELECT
            tenant_identifier,
            source_type,
            source_identifier,
            destination_type,
            destination_identifier,
            argMax(timestamp, timestamp) as latest_timestamp,
            argMax(status, timestamp) as latest_status
          FROM efdl_audit_db.pushes
          WHERE timestamp >= now() - INTERVAL 90 DAY
          GROUP BY
            tenant_identifier,
            source_type,
            source_identifier,
            destination_type,
            destination_identifier
          HAVING latest_timestamp >= now() - INTERVAL 90 DAY
          ORDER BY latest_timestamp DESC
        `,
        format: 'JSONEachRow',
      })

      const data = await result.json() as AuditDBPush[]

      const existingNodes = getNodes()
      const existingEdges = getEdges()

      // Create new visualization if it's the first fetch or if the number of nodes has changed and doesn't match the data.
      // We should also check that every node is
      const serviceNodes = existingNodes.filter(node => node.type === 'service')
      const dataEdges = existingEdges.filter(edge => edge.type === 'data')

      // We should also check that the number of edges matches the expected number of edges.
      const expectedEdges = calculateExpectedDataEdges(data)

      if (isInitialFetch || serviceNodes.length / 2 !== data.length || dataEdges.length !== expectedEdges) {
        const { datalayer, nodes, edges, flows } = translateFromAuditData(data)
        onVisualize(datalayer, nodes, edges, flows)
      }
      else {
        // Update existing nodes
        const { nodes: updatedNodes, edges: updatedEdges } = updateFromAuditData(data, existingNodes as AppNode[], existingEdges as AppEdge[])
        setNodes(updatedNodes)
        setEdges(updatedEdges)
      }
    }
    catch (error) {
      console.error('Failed to fetch audit data:', error)
      setError(`Refresh failed: ${(error as Error).message}`)
    }
  }, [getNodes, getEdges, setNodes, setEdges, onVisualize, setIsOpen])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.close()
      }
    }
  }, [client])

  // Handle auto-refresh
  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | null = null

    if (autoRefresh && client) {
      intervalId = setInterval(() => {
        fetchAuditData(client)
      }, refreshInterval * 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh, client, refreshInterval, fetchAuditData])

  const handleHostChange = (value: string) => {
    // Strip any protocol from the input if present
    const cleanHost = value.replace(/^https?:\/\//, '')
    setHost(cleanHost)
  }

  const getFullHost = () => {
    // Add protocol based on secure setting
    const protocol = secure ? 'https://' : 'http://'
    return `${protocol}${host}`
  }

  const handleConnection = async () => {
    setConnecting(true)
    setError(null)
    setSuccess(false)

    try {
      const newClient = createClient({
        url: `${getFullHost()}:${port}`,
        database: 'efdl_audit_db',
        username,
        password,
      })

      // First test basic connectivity
      await newClient.query({ query: 'SELECT 1' })
      setSuccess(true)

      // Set the client for later use
      setClient(newClient)

      // Initial data fetch with flag to indicate it's the first fetch
      await fetchAuditData(newClient, true)

      // Reset the form
      setSuccess(false)
      setPassword('')
    }
    catch (error) {
      console.error('Connection failed:', error)
      setError(`Connection failed: ${(error as Error).message}`)
    }
    finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    if (client) {
      client.close()
      setClient(null)
      setAutoRefresh(false)
    }
  }

  return (
    <Modal
      title={ti18n.translate(ti18n.keys.modalConnectionTitle)}
      subtitle={(
        <div className="react-flow__node-service-form-row">
          <Icon icon="plug" size={16} />
          <span>Audit DB Connection</span>
        </div>
      )}
      buttons={(
        <>
          {client
            ? (
                <Button
                  onClick={handleDisconnect}
                  style={{ width: 'fit-content', opacity: connecting ? 0.5 : 1 }}
                >
                  <Icon icon="plug" size={16} />
                  Disconnect
                </Button>
              )
            : (
                <Button
                  onClick={handleConnection}
                  style={{ width: 'fit-content', opacity: connecting ? 0.5 : 1 }}
                >
                  <Icon icon="plug" size={16} />
                  {connecting
                    ? ti18n.translate(ti18n.keys.modalConnectionConnecting)
                    : ti18n.translate(ti18n.keys.modalConnectionButton)}
                </Button>
              )}
        </>
      )}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={() => setIsOpen(false)}
    >
      <p>{ti18n.translate(ti18n.keys.modalConnectionDescription)}</p>
      <div className="react-flow__node-service-form">
        <div className="react-flow__node-service-form-group" style={{ flexGrow: 0, justifyContent: 'left' }}>
          <div className="react-flow__node-service-form-field">
            <h3>{ti18n.translate(ti18n.keys.modalConnectionHost)}</h3>
            <input
              type="text"
              value={host}
              onChange={e => handleHostChange(e.target.value)}
              placeholder="e.g. auditdb.dev.data-layer.com"
            />
          </div>

          <div className="react-flow__node-service-form-field" style={{ flexGrow: 0 }}>
            <h3>{ti18n.translate(ti18n.keys.modalConnectionPort)}</h3>
            <div className="react-flow__node-service-form-row">
              <input
                type="number"
                value={port}
                onChange={e => setPort(e.target.value)}
                placeholder="8123"
                style={{ width: '80px' }}
              />
            </div>
          </div>
          <div className="react-flow__node-service-form-field" style={{ flexGrow: 0 }}>
            <h3>{ti18n.translate(ti18n.keys.modalConnectionSecure)}</h3>
            <div className="react-flow__node-service-form-row" style={{ height: '34px' }}>
              <input
                type="checkbox"
                checked={secure}
                onChange={e => setSecure(e.target.checked)}
              />
              <label htmlFor="secure-connection">HTTPS</label>
            </div>
          </div>
        </div>

        <div className="react-flow__node-service-form-group">
          <div className="react-flow__node-service-form-field">
            <h3>{ti18n.translate(ti18n.keys.modalConnectionUsername)}</h3>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="default"
            />
          </div>

          <div className="react-flow__node-service-form-field">
            <h3>{ti18n.translate(ti18n.keys.modalConnectionPassword)}</h3>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="react-flow__node-service-form-group">
          <div className="react-flow__node-service-form-field" style={{ width: '49%' }}>
            <h3>Auto Refresh</h3>
            <div className="react-flow__node-service-form-row" style={{ height: '34px' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
                disabled={!client}
              />
              <label style={{ opacity: client ? 1 : 0.5 }}>Enable auto refresh</label>
            </div>
          </div>

          <div className="react-flow__node-service-form-field" style={{ width: '49%' }}>
            <h3>Refresh Interval (seconds)</h3>
            <input
              type="number"
              min="5"
              value={refreshInterval}
              onChange={e => setRefreshInterval(Math.max(10, Number.parseInt(e.target.value)))}
              style={{ width: '80px' }}
              disabled={!client || !autoRefresh}
            />
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {`${ti18n.translate(ti18n.keys.modalConnectionError)}: ${error}`}
          </div>
        )}
        {success && (
          <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>
            {ti18n.translate(ti18n.keys.modalConnectionSuccess)}
          </div>
        )}
      </div>
    </Modal>
  )
}
