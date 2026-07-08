import React from 'react'
import ReactModal from 'react-modal'

import { Button, ButtonType } from '@/components/Common/Button'

import { useTi18n } from '@/components/Core/Ti18nProvider'

export function Modal(
  {
    isOpen,
    setIsOpen,
    onClose,

    title,
    subtitle,
    buttons,

    children,
  }: {
    readonly isOpen: boolean
    readonly setIsOpen: (value: boolean) => void
    readonly onClose: () => void

    readonly title: string
    readonly subtitle?: React.ReactNode
    readonly buttons?: React.ReactNode

    readonly children: React.ReactNode
  },
) {
  const ti18n = useTi18n()

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Application Modal"
      className="modal" // App-specific styles
      overlayClassName="modal-overlay"
      ariaHideApp={false} // We're removing this as we can't control the app instance since this is a widget.
    >
      <div className="modal-navbar">
        <div className="modal-header">
          <h1 className="modal-heading">{title}</h1>
          {subtitle && <div className="modal-subtitle">{subtitle}</div>}
        </div>
        <div className="modal-actions">
          {buttons}
          <Button type={ButtonType.Secondary} onClick={() => setIsOpen(false)}>{ti18n.translate(ti18n.keys.genericClose)}</Button>
        </div>
      </div>
      <div className="modal-body">
        <div className="modal-content">
          {children}
        </div>
      </div>
    </ReactModal>
  )
}
