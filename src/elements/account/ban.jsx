import React from 'react';
import tt from 'counterpart';

import { Button } from 'semantic-ui-react';

export default class AccountBan extends React.Component {
    constructor(props) {
        super(props);
    }

    reload = () => {
        setTimeout(() => {
            window.location.reload()
        }, 500)
    }

    ban = (e) => {
        const { account, who } = this.props;
        this.props.actions.moderatorBanAccount(account.key, account, who, '',
            () => {
                this.reload()
            });
    };

    unBan = (e) => {
        const { account, who } = this.props;
        this.props.actions.moderatorUnBanAccount(account.key, account, who,
            () => {
                this.reload()
            });
    };

    render() {
        const { account, who, isBanned } = this.props;
        if (account.name === who && !isBanned) return false;
        return (
            <Button
                color={isBanned ? 'green' : 'red' }
                content={isBanned ? tt('forum_controls.unban') : tt('forum_controls.ban')}
                onClick={(isBanned) ? this.unBan : this.ban}
            />
        );
    }
}
