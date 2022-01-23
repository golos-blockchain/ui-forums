import React from 'react'
import Head from 'next/head'
import { withRouter } from 'next/router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { goToTop } from 'react-scrollable-anchor'

import { Grid } from 'semantic-ui-react'

import * as CONFIG from '@/config'
import * as accountActions from '@/actions/accountActions'
import * as breadcrumbActions from '@/actions/breadcrumbActions'
import * as chainstateActions from '@/actions/chainstateActions'
import * as moderationActions from '@/actions/moderationActions'
import * as postActions from '@/actions/postActions'
import * as preferenceActions from '@/actions/preferenceActions'
import * as statusActions from '@/actions/statusActions'

import AccountSidebar from '@/elements/account/sidebar'
import AccountTabs from '@/elements/account/tabs'
import { getPageTitle } from '@/utils/text'
import { wrapSSR, } from '@/server/ssr'
import { getAccount, getAccountPosts, getAccountResponses, getAccountDonates } from '@/server/getAccount'

export const getServerSideProps = wrapSSR(async (context) => {
    const { params, _store } = context
    let { username, section } = params
    const data = await getAccount(username)
    _store.dispatch(breadcrumbActions.setBreadcrumb([
        {
            name: `@${username}`,
            link: `/@${username}`
        }
    ]))
    _store.dispatch(chainstateActions.getAccountsResolved(data.data))
    if (section) {
        switch (section[0]) {
            case 'posts':
            {
                const posts = await getAccountPosts(data.vals, username)
                _store.dispatch(postActions.fetchPostByAuthorResolved({
                    account: username,
                    posts: posts.posts,
                    totalPosts: posts.total,
                    moders: data.moders,
                    supers: data.supers,
                    hidden: data.hidden,
                    banned: data.banned,
                }))
                break
            }
            case 'responses':
            {
                const responses = await getAccountResponses(data.vals, username)
                _store.dispatch(postActions.fetchPostResponsesByAuthorResolved({
                    account: username,
                    responses: responses.responses,
                    totalResponses: responses.total,
                }))
                break
            }
            case 'donates_from':
            {
                const donates = await getAccountDonates(data.vals, username, 'from')
                _store.dispatch(postActions.fetchDonatesByAuthorResolved({
                    account: username,
                    donates: donates.donates,
                    totalDonates: donates.total,
                }))
                break
            }
            case 'donates_to':
            {
                const donates = await getAccountDonates(data.vals, username, 'to')
                _store.dispatch(postActions.fetchDonatesByAuthorResolved({
                    account: username,
                    donates: donates.donates,
                    totalDonates: donates.total,
                }))
                break
            }
            default:
                break
        }
    }
    return {
        props: {
            isBanned: !!data.banned[username],
            supers: data.supers,
        }
    }
})

class Account extends React.Component {

    constructor(props) {
        super(props);
        if (process.browser) goToTop();
    }

    render() {
        const { username } = this.props.router.query
        const { isBanned, supers } = this.props
        const canIBan = this.props.account.name ? 
            supers.includes(this.props.account.name) : false
        return (
            <Grid>
                <Head>
                    <title>{getPageTitle(username)}</title>
                </Head>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Account))
