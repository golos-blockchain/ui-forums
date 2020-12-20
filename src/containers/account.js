import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { getPageTitle } from '../utils/text';

import { Grid } from 'semantic-ui-react';
import { goToTop } from 'react-scrollable-anchor';

import * as accountActions from '../actions/accountActions';
import * as breadcrumbActions from '../actions/breadcrumbActions';
import * as chainstateActions from '../actions/chainstateActions';
import * as postActions from '../actions/postActions';
import * as preferenceActions from '../actions/preferenceActions';
import * as statusActions from '../actions/statusActions';

import AccountSidebar from '../components/elements/account/sidebar';
import AccountTabs from '../components/elements/account/tabs';

class Account extends React.Component {

    constructor(props) {
        super(props);
        goToTop();
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

    render() {
        const { username } = this.props.match.params;
        return (
            <Grid>
                <Helmet>
                    <title>{getPageTitle(username)}</title>
                </Helmet>
                <Grid.Row>
                    <Grid.Column className='mobile hidden' width={4}>
                        <AccountSidebar {...this.props} />
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
        ...postActions,
        ...preferenceActions,
        ...statusActions
    }, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
