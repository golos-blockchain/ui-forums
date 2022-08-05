import React, { Component } from 'react'
import tt from 'counterpart'

import { Modal, Header, Button, } from 'semantic-ui-react';

let modalRef = null

export function showConfirm({ text, onYes, onNo }) {
    if (!modalRef || !modalRef.current) {
        throw new Error('showConfirm called but ConfirmModal not mount')
    }
    modalRef.current.show(text, onYes, onNo)
}

export async function showConfirmAsync(opts) {
    await new Promise((resolve, reject ) => {
        showConfirm({
            onYes: () => {
                resolve()
            },
            onNo: () => {
                reject(new Error('Canceled'))
            },
            ...opts
        })
    })
}

export class ConfirmModalInner extends Component {
    state={}

    show = (text, onYes = () => {}, onNo = () => {}) => {
        this.setState( {
            open: true,
            text, onYes, onNo
        })
    }

    onYes = e => {
        if (e) e.preventDefault()
        this.setState({
            open: false,
        })
        const { onYes } = this.state
        if (onYes) onYes()
    }

    onNo = e => {
        if (e) e.preventDefault()
        this.setState({
            open: false,
        })
        const { onNo } = this.state
        if (onNo) onNo()
    }

    render() {
        const { title, text, } = this.state
        return (<Modal
            open={this.state.open}
            basic
            size='small'
        >
            <Header icon='question' content={title || tt('confirm.title')} />
            <Modal.Content>
                <h4>{text}</h4>
            </Modal.Content>
            <Modal.Actions>
                <Button color='green' onClick={this.onYes}>{tt('g.yes')}</Button>
                <Button color='orange' icon onClick={this.onNo}>{tt('g.no')}</Button>
            </Modal.Actions>
        </Modal>)
    }
}

class ConfirmModal extends Component {
    constructor(props) {
        super(props)
        if (typeof(alert) === 'undefined') return
        modalRef = React.createRef()
    }

    render() {
        return <ConfirmModalInner ref={modalRef} />
    }
}

export default ConfirmModal
