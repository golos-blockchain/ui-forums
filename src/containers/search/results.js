import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { goToTop } from 'react-scrollable-anchor';
import tt from 'counterpart';
import ttGetByKey from '../../utils/ttGetByKey';

import { Button, Grid, Header, Input, Label, Popup, Segment, Table } from 'semantic-ui-react';

import * as CONFIG from '../../../config';
import * as searchActions from '../../actions/searchActions';

import Paginator from '../../components/global/paginator';

class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            query: props.match.params.query || '',
            page: 1,
            tagIdMap: {}
        };
        this.getTags = this.getTags.bind(this);
        this.getTags();
    }

    componentDidMount() {
        if (this.state.query) this.fetchSearch(1);
    }

    async getTags() {
        const GLOBAL_ID = CONFIG.FORUM._id.toLowerCase();
        let tagIdMap = {};
        try {
            let uri = CONFIG.REST_API;
            const response = await fetch(uri);
            if (response.ok) {
                const result = await response.json();
                const fillTags = (forums) => {
                    for (let [_id, forum] of Object.entries(forums)) {
                        tagIdMap['fm-' + GLOBAL_ID + '-' + _id.toLowerCase()] = _id;
                        if (forum.children) fillTags(forum.children);
                    }
                };
                fillTags(result.data.forums);
                this.setState({
                    tagIdMap
                });
            } else {
                console.error(response.status);
            }
        } catch(e) {
            console.error(e);
        }
    }

    onChange = (e, data) => {
        this.setState({
            query: data.value
        });
    };

    fetchSearch = (page) => {
        this.props.actions.searchBegin();
        this.props.actions.search({value: this.state.query, page});
        this.setState({
            page
        });
    };

    search = (e) => {
        if (e.type === 'keyup' && e.keyCode != 13) {
            return;
        }
        this.fetchSearch(1);
    };

    changePage = (page) => {
        this.fetchSearch(page);
        goToTop();
    };

    render() {
        const { search } = this.props;
        //if (!search.isLoading)
        //alert(JSON.stringify(search, null, 2))
        let results = [];
        let totalPosts = 0;
        let display = null;
        if (search.results.hits) {
            results = search.results.hits.hits.map((hit) => {
                let category = hit.fields.category[0];
                let _id = this.state.tagIdMap[category];
                if (!_id) return null; // some categories can be deleted, TODO: handle it on search request

                let parts = hit._id.split('.');
                let author = parts[0];
                let permlink = parts.slice(1).join();

                let url = '/' + _id + '/@' + author + '/' + permlink;

                let title = hit.highlight.title;
                title = title ? title[0] : hit.fields.title[0];
                title = title || 'Комментарий';
                let body = hit.highlight.body;
                body = body ? body[0] : hit.fields.body[0].substring(0, 100);

                return (<div>
                        <Link to={url}><h5 dangerouslySetInnerHTML={{__html: title}}></h5></Link>
                        <div dangerouslySetInnerHTML={{__html: body}}></div>
                        <br/>
                    </div>);
            });
            totalPosts = search.results.hits.total.value;
            display = (<div>
                    <b>{tt('search.results')} {totalPosts}</b> <Paginator
                        page={this.state.page}
                        perPage={20}
                        total={totalPosts}
                        callback={this.changePage}
                        /><br/><br/>
                    {results}
                    <Paginator
                        page={this.state.page}
                        perPage={20}
                        total={totalPosts}
                        callback={this.changePage}
                        />
                </div>);
        }
        return (<div>
                <br />
                <div>
                    <Input name='query'
                        value={this.state.query || undefined}
                        placeholder={tt('search.placeholder')}
                        onKeyUp={this.search}
                        onChange={this.onChange}
                        fluid action={
                            <Button primary onClick={this.search}>{tt('g.search')}</Button>
                    } />
                   
                </div>
                <br />
                {display}
            </div>);
    }
}

function mapStateToProps(state, ownProps) {
    return {
        search: state.search
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators(searchActions, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchResults));
