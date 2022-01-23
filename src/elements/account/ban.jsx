import React from 'react';
import tt from 'counterpart';

import { Button } from 'semantic-ui-react';

export default class AccountBan extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    ban = (e) => {
        const { account, who } = this.props;
        this.props.actions.moderatorBanAccount(account.key, account, who);
        setTimeout(() => {
            window.location.reload();
        },
        500);
    };

    unBan = (e) => {
        const { account, who } = this.props;
        this.props.actions.moderatorUnBanAccount(account.key, account, who);
        setTimeout(() => {
            window.location.reload();
        },
        500);
    };

    render() {
        const { account, who, isBanned } = this.props;
        const { loading } = this.state;
        if (account.name === who && !isBanned) return false;
        return (
            <Button
                color={loading ? 'grey' : isBanned ? 'green' : 'red' }
                content={isBanned ? tt('forum_controls.unban') : tt('forum_controls.ban')}
                loading={loading}
                onClick={loading ? () => {} : (isBanned) ? this.unBan : this.ban}
            />
        );
    }
}
