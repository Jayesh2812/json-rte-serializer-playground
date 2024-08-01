import { Modal } from 'antd'
import React from 'react'

function ModalWrapper({children}: {children: React.ReactNode}) {
  return (
    <Modal>
        {children}
    </Modal>
  )
}

export default ModalWrapper