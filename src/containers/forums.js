import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop } from 'react-scrollable-anchor';
import { withRouter } from 'react-router-dom';
import tt from 'counterpart';
import ttGetByKey from '../utils/ttGetByKey';
import fetch from 'cross-fetch';

import { Button, Dimmer, Divider, Loader, Grid, Header, Segment, Popup } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as accountActions from '../actions/accountActions';
import * as breadcrumbActions from '../actions/breadcrumbActions';
import * as postActions from '../actions/postActions';
import * as statusActions from '../actions/statusActions';
import * as preferenceActions from '../actions/preferenceActions';

import ForumIndex from '../components/elements/forum/index';
import ForumManage from './forum/manage';

class Forums extends React.Component {
    constructor(props, state) {
        if (process.browser) goToTop();
        super(props);
        this.state = {
            group: false,
            minimized: props.preferences.forums_minimized || [],
            forums: null,
            moders: [],
            supers: [],
            admins: [],
            showConfig: (['categories', 'permissions'].indexOf(props.section) >= 0) ? true : false,
        };
        this.getForums = this.getForums.bind(this);
        this.getForums();
    }

    componentDidMount() {
        this.props.actions.setBreadcrumb([]);
    }

    componentWillMount() {
        this.props.actions.resetPostState();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.section === this.props.section) return;
        this.setState({
            showConfig: (['categories', 'permissions'].indexOf(nextProps.section) >= 0) ? true : false
        });
        this.getForums();
    }

    toggleVisibility = (e, props) => {
        const forum = props.value;
        let { minimized } = this.state;
        if(minimized.indexOf(forum) !== -1) {
            const index = minimized.indexOf(forum);
            minimized.splice(index, 1);
        } else {
            minimized.push(forum);
        }
        this.props.actions.setPreference({ 'forums_minimized': minimized });
        this.setState({ minimized });
    }

    async getForums() {
        try {
            let uri = CONFIG.REST_API;
            if (this.props.forums && this.props.forums.group) {
                uri = uri + '/' + this.props.forums.group;
            }
            const response = await fetch(uri);
            if (response.ok) {
                const result = await response.json();
                this.setState({
                    forums: result.data.forums,
                    moders: result.data.moders,
                    supers: result.data.supers,
                    admins: result.data.admins,
                    users: result.data.users,
                    group: this.props.forums.group
                });
                this.props.actions.setStatus({'network': result.network});
            } else {
                console.error(response.status);
            }
        } catch(e) {
            console.error(e);
        }
    }

    showConfig = () => {
        if (!this.state.showConfig) {
            this.setState({ showConfig: true });
            this.props.history.push(`/categories`);
        }
    };
    hideConfig = () => {
        if (this.state.showConfig) {
            this.setState({ showConfig: false });
            this.props.history.push(`/`);
            this.getForums();
        }
    };
    toggleConfig = () => (this.state.showConfig) ? this.hideConfig() : this.showConfig();

    render() {
        let loaded = !!this.state.forums,
            loader = {
                style: {
                    minHeight: '100px',
                    display: 'block'
                }
            },
            activeusers = false,
            account = this.props.account,
            display = (<Dimmer active inverted style={loader.style}>
                <Loader size='large' />
            </Dimmer>);
        if (loaded) {
            let { forums, showConfig } = this.state; // users
            // Find the unique forum groupings
            let groups = [];
            let prev_group = 0; // instead of null - hack for forums w/o groups
            for (let [, forum] of Object.entries(forums)) {
                if (forum.group === prev_group) continue;
                groups.push(forum.group);
                prev_group = forum.group;
            }

            /*let activeusers = (
                <Segment>
                    <Header size='large'>
                        Active Posters
                        <Header.Subheader>
                            {' '}<strong>{users.stats.app}</strong>{' '}
                            users have posted on chainBB in the last 24 hours, out of a total of
                            {' '}<strong>{users.stats.total}</strong>{' '}
                            users.
                        </Header.Subheader>
                    </Header>
                    <Divider horizontal>
                        Recent chainBB users
                    </Divider>
                    {users.list.map((user, i) => <span key={i}>
                        {!!i && ', '}
                        <AccountLink username={user['_id']} />
                    </span>)}
                </Segment>
            );*/
            if (showConfig) {
                let forum4 = {
                    target: CONFIG.FORUM
                };
                display = (
                    <ForumManage
                        account={account}
                        newForum={this.state.newForum}
                        section={this.props.section}
                        target={CONFIG.FORUM}
                        forum={forum4}
                        categories={this.state.forums}
                        moders={this.state.moders}
                        supers={this.state.supers}
                        admins={this.state.admins}
                        hideConfig={this.hideConfig.bind(this)}
                    />
                );
            } else {
                display = groups.map((group) => {
                    const isMinimized = this.state.minimized.indexOf(group) >= 0;
                    let groupings = [];
                    for (let [_id, forum] of Object.entries(forums)) {
                        if (forum.group !== group) continue;
                        groupings.push(<ForumIndex key={_id} _id={_id} forum={forum} isMinimized={isMinimized} />);
                    }
                    return (<div key={group || 'main'} style={{marginBottom: '10px'}}>
                                <Segment secondary attached>
                                    <Grid>
                                        <Grid.Row verticalAlign='middle'>
                                            <Grid.Column computer={1} tablet={2} mobile={2}>
                                                {/*<Button
                                                    basic
                                                    onClick={this.toggleVisibility}
                                                    value={group}
                                                    icon={isMinimized ? 'plus' : 'minus'}
                                                    size='small'
                                                />*/}
                                            </Grid.Column>
                                            <Grid.Column computer={6} tablet={8} mobile={8}>
                                                <Header size='tiny'>
                                                    {group} {tt('forum_controls.categories')}
                                                </Header>
                                            </Grid.Column>
                                            <Grid.Column width={2} className='tablet or lower hidden' textAlign='center'>
                                                <Header size='tiny' style={{ display: isMinimized ? 'none' : '' }}>
                                                    {tt('forum_controls.posts')}
                                                </Header>
                                            </Grid.Column>
                                            <Grid.Column width={2} className='tablet or lower hidden'>
                                                <Header size='tiny' textAlign='center' style={{ display: isMinimized ? 'none' : '' }}>
                                                    {tt('forum_controls.replies')}
                                                </Header>
                                            </Grid.Column>
                                            <Grid.Column computer={5} tablet={6} mobile={6} style={{ display: isMinimized ? 'none' : '' }}>
                                                <Header size='tiny' textAlign='center'>
                                                    {tt('forum_controls.recently_active')}
                                                </Header>
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Segment>
                                {groupings}
                            </div>);
                });
            }
        }
        return (
            <div>
                <Segment stacked color='blue'>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={14}>
                                <Header
                                    color='blue'
                                    size='huge'
                                >
                                <Header.Content dangerouslySetInnerHTML={{__html: ttGetByKey(CONFIG.FORUM, 'title')}}></Header.Content>
                                <Header.Subheader dangerouslySetInnerHTML={{__html: ttGetByKey(CONFIG.FORUM, 'description')}}></Header.Subheader>
                                </Header>
                            </Grid.Column>
                            <Grid.Column width={2}>
                                <Popup
                                    trigger={
                                        <Button
                                            size='large'
                                            floated='right'
                                            icon='cogs'
                                            onClick={this.showConfig.bind(this)}
                                        />
                                    }
                                    content={tt('forum_controls.forum_info')}
                                    inverted
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                {display}
                <Divider />
                {activeusers}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        preferences: state.preferences,
        status: state.status
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...breadcrumbActions,
        ...postActions,
        ...statusActions,
        ...preferenceActions
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Forums));
