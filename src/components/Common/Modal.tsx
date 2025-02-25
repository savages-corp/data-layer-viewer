import React from 'react'
import ReactModal from 'react-modal'
import Button from './Button'

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
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Application Modal"
      className="modal" // App-specific styles
      overlayClassName="modal-overlay"
    >
      <div className="modal-navbar">
        <h1 className="modal-heading">{title}</h1>
        <Button onClick={() => setIsOpen(false)}>Close</Button>
      </div>
      <div className="modal-content">
        {children}
      </div>
    </ReactModal>
  )
}

export default Modal
