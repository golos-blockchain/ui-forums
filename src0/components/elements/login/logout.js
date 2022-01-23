import React from 'react';
import tt from 'counterpart';

import { Dropdown } from 'semantic-ui-react';

import { notifyLogout } from '../../../utils/notifications';

export default class LogoutItem extends React.Component {
    logout = async (e) => {
        this.props.actions.signoutAccount();
        try {
            await notifyLogout();
        } catch (error) {
            console.error('notifyLogout', error);
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
