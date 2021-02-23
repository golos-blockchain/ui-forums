import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Breadcrumb, Container, Grid, Icon } from 'semantic-ui-react';

import * as breadcrumbActions from '../../actions/breadcrumbActions';
import SearchBox from '../../containers/search';

class BreadcrumbMenu extends Component {
    render() {
        let trail = this.props.breadcrumb.trail,
            post = this.props.post;
        if (post && post.breadcrumb) {
            trail = trail.concat(post.breadcrumb);
            trail = Array.from(trail.reduce((m, t) => m.set(t.link, t), new Map()).values());
        }
        let withSearch = this.props.withSearch;
        if (withSearch) {
            let goodPath = window.location.pathname;
            goodPath = goodPath === '/' || goodPath.startsWith('/f/')
            withSearch = goodPath;
        }
        return (
            <Container>
                <Grid stackable>
                    <Grid.Row verticalAlign='middle'>
                        <Grid.Column width={12}>
                            <Breadcrumb>
                                {trail.map((crumb, i) => <span key={i}>
                                    {!!i && <Breadcrumb.Divider></Breadcrumb.Divider>}
                                    <Link to={crumb.link} className='section'>
                                        {!i && <Icon name='home' color='blue' />}
                                        {crumb.name}
                                    </Link>
                                </span>)}
                            </Breadcrumb>
                        </Grid.Column>
                        {withSearch ? <Grid.Column width={4}>
                            <SearchBox /><div style={{paddingBottom: '50px'}}></div>
                        </Grid.Column> : null}
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        breadcrumb: ownProps.breadcrumb || state.breadcrumb,
        post: state.post
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators(breadcrumbActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(BreadcrumbMenu);
