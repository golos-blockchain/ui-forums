import React from 'react';
import tt from 'counterpart';

import { Segment } from 'semantic-ui-react'

export default class AccountAbout extends React.Component {
    render() {
        let content = (<Segment attached padded="very" loading />);
        if (this.props.chainstate && this.props.chainstate.accounts) {
            const { username } = this.props.match.params;
            const accounts = this.props.chainstate.accounts;
            if (accounts[username]) {
                const acc = accounts[username];

                let about = '';
                let website = '';
                let meta = null;
                try {
                    meta = JSON.parse(acc.json_metadata);
                } catch (ex) {
                }
                if (meta && meta.profile) {
                    website = meta.profile.website || '';
                    about = meta.profile.about || '';
                }
                content = (
                    <Segment attached>
                        {website != '' ? (<div>{tt('account.website')}&nbsp;<a href={website}>{website}</a></div>) : null}
                        {about}
                    </Segment>
                );
            }
        }
        return content;
    }
}
