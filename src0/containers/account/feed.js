import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop } from 'react-scrollable-anchor';
import sortBy from 'lodash/sortBy';

import { Button, Dimmer, Loader, Grid, Header, Segment    } from 'semantic-ui-react';

import * as accountActions from '../../actions/accountActions';
import * as breadcrumbActions from '../../actions/breadcrumbActions';
import * as chainstateActions from '../../actions/chainstateActions';
import * as postActions from '../../actions/postActions';
import * as statusActions from '../../actions/statusActions';
import * as preferenceActions from '../../actions/preferenceActions';

import FeedPost from '../../components/elements/feed/post';
import FeedTitle from '../../components/elements/feed/title';

class Feed extends React.Component {

    constructor(props, state) {
        goToTop();
        super(props);
        const user = (props.account) ? props.account.name : false;
        if (user) {
            this.props.actions.getState(`/@${props.account.name}/feed`);
        }
        this.state = {
            ids: [],
            items: [],
            loaded: false,
            user,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.chainstate) {
            if (nextProps.chainstate.paths[`/@${this.state.user}/feed`]) {
                const content = nextProps.chainstate.paths[`/@${this.state.user}/feed`].content;
                let { items, ids } = this.state;
                Object.keys(content).map(function(id, idx) {
                    if(ids.indexOf(id) === -1) {
                        ids.push(id);
                        items.push(content[id]);
                    }
                    return true;
                });
                const sorted =sortBy(items, (o) => {
                    return (o.first_reblogged_on) ? Date.parse(o.first_reblogged_on) : Date.parse(o.created);
                }).reverse();
                this.setState({ items: sorted, ids, loaded: true });
            }
        }
        if (nextProps.account && this.state.user !== nextProps.account.name) {
            this.props.actions.getState(`/@${nextProps.account.name}/feed`);
        }
        this.setState({ user: nextProps.account.name });
    }

    componentDidMount() {
        this.props.actions.setBreadcrumb([]);
    }

    refresh() {
        this.setState({
            ids: [],
            items: [],
            loaded: false,
        });
        this.props.actions.getState(`/@${this.props.account.name}/feed`);
    }

    render() {
        let loaded = this.state.loaded,
            loader = {
                style:{
                    minHeight: '100px',
                    display: 'block'
                },
                content: 'Loading'
            },
            display = (
                <Dimmer active inverted style={loader.style}>
                    <Loader size='large' content={loader.content}/>
                </Dimmer>
            );
        if (loaded) {
            if (this.state.items.length > 0) {
                display = this.state.items.map((item, idx) => {
                    return <FeedPost topic={item} key={idx} />
                });
            } else {
                display = (
                    <Segment attached textAlign='center'>
                        <Header>
                            No posts found
                            <Header.Subheader>
                                Either you haven't followed anyone or the people you followed haven't posted yet!
                            </Header.Subheader>
                        </Header>
                    </Segment>
                );
            }
        }
        return(
            <div>
                <Helmet>
                    <title>Activity Feed</title>
                </Helmet>
                <FeedTitle />
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Button
                                basic
                                color='purple'
                                content='Refresh'
                                icon='refresh'
                                onClick={this.refresh.bind(this)}
                            />
                        </Grid.Column>
                        <Grid.Column width={8}>

                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Segment attached='top' secondary>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={1}></Grid.Column>
                            <Grid.Column width={1}></Grid.Column>
                            <Grid.Column width={10}>
                                <Header size='small'>
                                    Post
                                </Header>
                            </Grid.Column>
                            <Grid.Column width={4} only='large screen' textAlign='center'>
                                <Header size='small'>
                                    Activity
                                </Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                {display}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        preferences: state.preferences,
        chainstate: state.chainstate,
        status: state.status
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...breadcrumbActions,
        ...postActions,
        ...chainstateActions,
        ...statusActions,
        ...preferenceActions
    }, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
