import React from 'react';
import golos, { multiauth } from 'golos-lib-js'
import tt from 'counterpart';

import { Dropdown } from 'semantic-ui-react';

import { notifyLogout } from '@/utils/notifications';

export default class LogoutItem extends React.Component {
    logout = async (e) => {
        const isMultiAuth = this.props.account.name && !this.props.account.key
        if (isMultiAuth) {
            await multiauth.logout()
            this.props.actions.signoutAccount()
        } else {
            this.props.actions.signoutAccount()
            try {
                await notifyLogout();
            } catch (error) {
                console.error('notifyLogout', error);
            }
        }
    };
    render() {
        return (
            <Dropdown.Item
                color='orange'
                size='mini'
                icon='sign out'
                onClick={this.logout}
                content={tt('account.sign_out')}
            />
        );
    }
}
