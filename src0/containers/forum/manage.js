import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import tt from 'counterpart';

import { Button, Header, Icon, Segment, Tab } from 'semantic-ui-react';

import * as accountActions from '../../actions/accountActions';
import * as forumActions from '../../actions/forumActions';
import * as statusActions from '../../actions/statusActions';
import * as preferenceActions from '../../actions/preferenceActions';

import AccountLink from '../../components/elements/account/link';
import ForumCategoriesForm from './manage/categories';
//import ForumUpgrade from '../../components/elements/forum/manage/upgrade';
import ForumPermissions from './manage/permissions';
import ForumReservation from '../../components/elements/forum/reservation';

class ForumManage extends React.Component {
    componentDidMount() {
        const { forum, reservation } = this.props;
        const id = (reservation) ? reservation._id : forum.target._id;
        if (!this.props.forum || !this.props.forum.data) {
            this.props.actions.fetchForumDetails(id);
        }
        this.interval = setInterval(() => this.props.actions.fetchForumDetails(id), 15000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate(prevProps, prevState) {
        // If we have a reservation, and are returned a forum, the transfer has completed
        if (this.props.reservation && this.props.forum.target) {
            this.props.completeReservation();
        }
    }

    onTabChange = (e, data) => {
        if (data.panes[data.activeIndex].menuItem.key === 'close') {
            this.props.hideConfig();
        } else {
            // Push the history if the tab has changed
            if(this.props.section !== data.panes[data.activeIndex].menuItem.key) {
                this.props.history.push(`/${data.panes[data.activeIndex].menuItem.key}`);
            }
        }
    };

    getActiveIndex = (panes, key) => {
        const indexes = panes.map((pane) => pane.menuItem.key);
        return indexes.indexOf(key);
    };

    render() {
        const { account, forum, reservation, categories, moders, supers, admins } = this.props;
        if (reservation) {
            return (<ForumReservation status={this.props.status} reservation={reservation} />);
        }
        let panes = [
            //{ menuItem: { key: 'overview', icon: 'cubes', color: 'black', content: tt('forum_controls.overview') }, render: () => <ForumOverview forum={forum} /> },
            { menuItem: { key: 'categories', icon: 'indent', color: 'red', content: tt('forum_controls.categories') }, render: () => <ForumCategoriesForm newForum={this.props.newForum} categories={categories} hideConfig={this.props.hideConfig}/> },
            { menuItem: { key: 'permissions', icon: 'protect', color: 'purple', content: tt('forum_controls.permissions') }, render: () => <ForumPermissions account={account} moders={moders} supers={supers} admins={admins} /> },
            //{ menuItem: { key: 'configuration', icon: 'settings', color: 'orange', content: tt('forum_controls.configuration') }, render: () => <ForumConfigForm newForum={this.props.newForum} hideConfig={this.props.hideConfig}/> },
            //{ menuItem: { key: 'upgrades', icon: 'arrow circle up', color: 'blue', content: 'Upgrades' }, render: () => <ForumUpgrade account={account} forum={forum} target={target} /> },
            { menuItem: { key: 'close', icon: 'window close', color: 'black', position: 'right' } },
        ];
        let display = (
            <Segment>
                <Segment padded textAlign='center'>
                    <Icon name='warning' size='huge' />
                    <Header>
                        This forum has not yet been setup.
                        <Header.Subheader>
                            The forum will be displayed once
                            {' '}
                            <AccountLink username={forum.creator} />
                            {' '}
                            completes it's initial setup.
                        </Header.Subheader>
                    </Header>
                </Segment>
            </Segment>
        );
        if (forum.target._id) {
            // If this is a legacy forum, only display pane #1 (overview) and the last one (close)
            if (!forum.target.creator) {
                panes = [panes[0], panes[panes.length - 1]];
            }
            display = (
                <Tab
                    activeIndex={this.getActiveIndex(panes, this.props.section || 'overview')}
                    menu={{
                        pointing: true
                    }}
                    onTabChange={this.onTabChange}
                    panes={panes}
                    style={{marginTop: '1em'}}
                />
            );
        }
        return (
            <div>
                {display}
                <Segment basic textAlign='center'>
                    <Button
                        onClick={this.props.hideConfig.bind(this)}
                        content={tt('forum_controls.return_ro_froum')}
                        size='small'
                        color='blue'
                    />
                </Segment>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        forum: ownProps.forum,
        preferences: state.preferences,
        status: state.status
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...forumActions,
        ...preferenceActions,
        ...statusActions,
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ForumManage));
