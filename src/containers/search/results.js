import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { goToTop } from 'react-scrollable-anchor';
import golos from 'golos-classic-js';
import tt from 'counterpart';
import truncate from 'lodash/truncate';
import sanitize from 'sanitize-html';

import { Button, Dropdown, Input } from 'semantic-ui-react';

import * as CONFIG from '../../../config';
import * as searchActions from '../../actions/searchActions';

import Paginator from '../../components/global/paginator';
import remarkableStripper from '../../utils/remarkableStripper';
import TimeAgoWrapper from '../../utils/TimeAgoWrapper';

class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            query: props.match.params.query || '',
            page: 1,
            tagIdMap: {},
            where: tt('search.where_anywhere'),
            dateFrom: '',
            dateTo: '',
            authorLookup: [],
            author: ''
        };
        this.getTags = this.getTags.bind(this);
        this.getTags();
    }

    componentDidMount() {
        this.fetchSearch(1);
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
        let filters = [];
        if (this.state.where === tt('search.where_posts')) {
            filters.push({
                "term": {
                    "depth": 0
                }
            });
        } else if (this.state.where === tt('search.where_comments')) {
            filters.push({
                "bool": {
                    "must_not": {
                        "term": {
                            "depth": 0
                        }
                    }
                }
            });
        }
        if (this.state.dateFrom || this.state.dateTo) {
            let range = {
                "range": {
                    "created": {
                    }
                }
            };
            if (this.state.dateFrom) {
                range.range.created.gte = this.state.dateFrom + 'T00:00:00';
            }
            if (this.state.dateTo) {
                range.range.created.lte = this.state.dateTo;
            }
            filters.push(range);
        }
        if (this.state.author) {
            filters.push({
                "term": {
                    "author": this.state.author
                }
            });
        }
        this.props.actions.searchBegin();
        this.props.actions.search({value: this.state.query, page, filters});
        this.setState({
            page
        });
    };

    search = (e) => {
        if (e.type === 'keyup' && e.keyCode !== 13) {
            return;
        }
        this.fetchSearch(1);
    };

    changePage = (page) => {
        this.fetchSearch(page);
        goToTop();
    };

    _reloadWithSettings = (newState) => {
        this.setState(newState, () => {
            this.fetchSearch(1);
        });
    };

    handleWhereChange = (e, { value }) => {
        this._reloadWithSettings({
            where: value
        });
    };

    handleDateFromChange = (e, { value }) => {
        this._reloadWithSettings({
            dateFrom: value
        });
    };

    handleDateToChange = (e, { value }) => {
        this._reloadWithSettings({
            dateTo: value
        });
    };

    handleDateClear = (e) => {
        this._reloadWithSettings({
            dateFrom: '',
            dateTo: ''
        });
    };

    handleAuthorLookup = (e) => {
        if (e.keyCode === 13) return;
        golos.api.lookupAccounts(e.target.value.toLowerCase(), 6, (err, data) => {
            let options = data.map((name) => {
                return {text: name, value: name};
            });
            options.unshift({text: tt('g.author'), value: ''});
            this.setState({
                authorLookup: options
            });
        });
    }
    handleAuthorChange = (e, { value }) => {
        this._reloadWithSettings({
            author: value
        })
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
                let root_author = hit.fields.root_author[0];
                let root_permlink = hit.fields.root_permlink[0];

                let url = '/' + _id + '/@' + root_author + '/' + root_permlink;

                let title = hit.highlight && hit.highlight.title;
                title = title ? title[0] : hit.fields.root_title[0];
                if (root_permlink !== permlink) {
                    title = 'RE: ' + title;
                    url += '#@' + author + '/' + permlink;
                }
                let body = hit.highlight && hit.highlight.body;
                body = body ? body[0].split('</em> <em>').join(' ') : truncate(hit.fields.body[0], {length: 200});

                body = remarkableStripper.render(body);
                body = sanitize(body, {allowedTags: ['em', 'img']});

                return (<div>
                        <Link to={url}><h4 dangerouslySetInnerHTML={{__html: title}}></h4></Link>
                        <Link to={url}><span style={{color: 'rgb(180, 180, 180)'}}>
                            <TimeAgoWrapper date={`${hit.fields.created[0]}Z`} />
                            &nbsp;—&nbsp;@
                            {hit.fields.author[0]}
                        </span></Link>
                        <div dangerouslySetInnerHTML={{__html: body}}></div>
                        <br/>
                    </div>);
            });
            totalPosts = search.results.hits.total.value;
            display = (<div className='golossearch-results'>
                    <b>{tt('search.results')} {totalPosts}</b> <Paginator
                        page={this.state.page}
                        perPage={20}
                        total={totalPosts}
                        callback={this.changePage}
                        showMorePages={true}
                        /><br/><br/>
                    {results}
                    <Paginator
                        page={this.state.page}
                        perPage={20}
                        total={totalPosts}
                        callback={this.changePage}
                        showMorePages={true}
                        />
                </div>);
        }
        const whereSearch = [
            {
                key: tt('search.where_posts'),
                text: tt('search.where_posts'),
                value: tt('search.where_posts')
            },
            {
                key: tt('search.where_comments'),
                text: tt('search.where_comments'),
                value: tt('search.where_comments')
            },
            {
                key: tt('search.where_anywhere'),
                text: tt('search.where_anywhere'),
                value: tt('search.where_anywhere')
            }
        ];

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
                <Dropdown
                    defaultValue={whereSearch[2].value}
                    style={{minWidth: '150px'}}
                    selection
                    options={whereSearch}
                    onChange={this.handleWhereChange}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Input
                    type='date'
                    value={this.state.dateFrom}
                    onChange={this.handleDateFromChange}
                />
                &nbsp;&nbsp;-&nbsp;&nbsp;
                <Input
                    type='date'
                    value={this.state.dateTo}
                    onChange={this.handleDateToChange}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button
                    icon='delete'
                    content={tt('search.alltime')}
                    onClick={this.handleDateClear}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Dropdown
                    options={this.state.authorLookup}
                    value={this.state.author}
                    placeholder={tt('g.author')}
                    noResultsMessage=''
                    search
                    selection
                    clearable
                    onChange={this.handleAuthorChange}
                    onKeyUp={this.handleAuthorLookup}
                />
                <br />
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
