import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop } from 'react-scrollable-anchor';

import { Grid } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as accountActions from '../actions/accountActions';
import * as breadcrumbActions from '../actions/breadcrumbActions';
import * as chainstateActions from '../actions/chainstateActions';
import * as moderationActions from '../actions/moderationActions';
import * as postActions from '../actions/postActions';
import * as preferenceActions from '../actions/preferenceActions';
import * as statusActions from '../actions/statusActions';

import AccountSidebar from '../components/elements/account/sidebar';
import AccountTabs from '../components/elements/account/tabs';
import { getPageTitle } from '../utils/text';

class Account extends React.Component {

    constructor(props) {
        super(props);
        if (process.browser) goToTop();
        this.state = {
            isBanned: false,
            canIBan: false,
        };
        this.getModerationInfo = this.getModerationInfo.bind(this);
        this.getModerationInfo();
    }

    componentWillMount() {
        const { username } = this.props.match.params;
        this.props.actions.setBreadcrumb([
            {
                name: `@${username}`,
                link: `/@${username}`
            }
        ]);
    }

    async getModerationInfo() {
        try {
            const { username } = this.props.match.params;
            let uri = CONFIG.rest_api + '/@' + username;
            const response = await fetch(uri);
            if (response.ok) {
                const result = await response.json();
                this.setState({
                    isBanned: !!result.banned[username],
                    canIBan: !!result.supers.includes(this.props.account.name)
                });
            } else {
                console.error(response.status);
            }
        } catch(e) {
            console.error(e);
        }
    }

    render() {
        const { username } = this.props.match.params;
        const { isBanned, canIBan } = this.state;
        return (
            <Grid>
                <Helmet>
                    <title>{getPageTitle(username)}</title>
                </Helmet>
                <Grid.Row>
                    <Grid.Column className='mobile hidden' width={4}>
                        <AccountSidebar {...this.props} isBanned={isBanned} canIBan={canIBan} />
                    </Grid.Column>
                    <Grid.Column mobile={16} tablet={12} computer={12}>
                        <AccountTabs {...this.props} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        chainstate: state.chainstate,
        post: state.post,
        preferences: state.preferences,
        status: state.status
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...breadcrumbActions,
        ...chainstateActions,
        ...moderationActions,
        ...postActions,
        ...preferenceActions,
        ...statusActions
    }, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
