import React from 'react'
import LoginModal from '@/elements/login/modal'

export default class LoginButton extends React.Component {
    render() {
        return (
            <LoginModal {...this.props} />
        )
    }
}
