import React from 'react';
import tt from 'counterpart';

import { Dropdown } from 'semantic-ui-react';

export default class LogoutItem extends React.Component {
    logout = (e) => {
        this.props.actions.signoutAccount();
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
