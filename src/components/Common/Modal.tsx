import React from 'react'
import ReactModal from 'react-modal'

import { useTi18n } from '../Core/Ti18nProvider'

import { Button } from './Button'

export function Modal(
  {
    isOpen,
    setIsOpen,
    onClose,

    title,

    children,
  }: {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    onClose: () => void

    title: string

    children: React.ReactNode
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
        <h1 className="modal-heading">{title}</h1>
        <Button onClick={() => setIsOpen(false)}>{ti18n.translate(ti18n.keys.genericClose)}</Button>
      </div>
      <div className="modal-content">
        {children}
      </div>
    </ReactModal>
  )
}
