import React from 'react';
import { Link } from 'react-router-dom';
import tt from 'counterpart';

import { Popup } from 'semantic-ui-react';

import AccountCard from '../../../containers/account/card';

export default class AccountLink extends React.Component {
    render() {
        const { color, username, reputation, noPopup, isBanned } = this.props;
        const content = this.props.content || `@${username}`;
        const link = (
            <Link to={`/@${username}`} style={{color, textDecoration: isBanned ? 'line-through' : undefined}}>
                {content}
            </Link>
        );
        if (noPopup) return link;
        return (<span>
                <AccountCard
                    username={username}
                    trigger={link}
                />
                {reputation ? <Popup
                    content={tt('account.reputation')}
                    trigger={<span>&nbsp;({reputation})</span>}
                    mouseEnterDelay={500}
                    inverted
                /> : null}
            </span>
        );
    }
}
