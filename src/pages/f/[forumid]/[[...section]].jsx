import React from 'react'
import Head from 'next/head'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactDOMServer from 'react-dom/server'
import tt from 'counterpart'
import fetch from 'cross-fetch'

import { Accordion, Dimmer, Grid, Header, Icon, Loader, Message, Segment } from 'semantic-ui-react'

import * as breadcrumbActions from '@/actions/breadcrumbActions';
import * as forumActions from '@/actions/forumActions';
import * as moderationActions from '@/actions/moderationActions';
import * as postActions from '@/actions/postActions';

import ForumControls from '@/elements/forum/controls';
import ForumIndex from '@/elements/forum/index';
import ForumTitle from '@/elements/forum/title';
import Forum404 from '@/elements/forum/404';
import ForumEmpty from '@/elements/forum/empty';
import ForumPosts from '@/elements/forum/posts';
import PostForm from '@/modules/post/form';
import { getForumName, getPageTitle } from '@/utils/text';
import { getForum, getForumData } from '@/server/getForums'
import { wrapSSR, } from '@/server/ssr'
import { withRouter } from '@/utils/withRouter'

import importNoty from '@/utils/importNoty';

export const getServerSideProps = wrapSSR(async ({ req, res, params, query, _store, }) => {
    const page = query.page ? parseInt(query.page) : 1
    const f = await getForum(params.forumid)
    if (f.forum) { // forum url correct
        let trail = f.forum.trail.map(item => {
            return {
                name: getForumName(item),
                link: `/f/${item._id}`
            };
        });
        _store.dispatch(breadcrumbActions.setBreadcrumb(trail));
    } else {
        res.statusCode = 404
    }

    if (query.__preloading) {
        return {
            props: {
                loading: true,
                forum: {
                    ...f.forum,
                    moders: f.moders,
                    supers: f.supers,
                    hidden: f.hidden,
                    banned: f.banned,
                },
                childForums: f.childForums,
            }
        }
    }
    
    let data = await getForumData(f.vals, f._id, f.forum, page, query.filter)

    let forumNew = null
    const { forum, moders, supers, hidden, banned } = f
    if (forum)
        forumNew = Object.assign({moders, supers, hidden, banned}, forum)

    return {
        props: {
            childForums: f.childForums,
            topics: data.data,
            forum: forumNew,
            filter: query.filter || '',
            page,
        }
    }
})

class ForumLayout extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.state = {
            topics: props.topics,
            newForum: false,
            showNewPost: false,
            showModerated: false,
            showSubforums: true,
        };
    }

    getSection = (props) => {
        let { section, } = (props || this.props).router.query
        return section ? section[0] : ''
    }

    changePage = (page) => {
        this.props.router.withQuery('page', page).push({
            scroll: true
        })
    }

    showNewPost = () => this.setState({ showNewPost: true });
    hideNewPost = (e) => this.setState({ showNewPost: false });
    showSubforums = () => this.setState({showSubforums: true});
    hideSubforums = () => this.setState({showSubforums: false});
    toggleSubforums = () => (this.state.showSubforums) ? this.hideSubforums() : this.showSubforums();
    handleNewPost = async (data) => {
        let Noty = await importNoty();
        if (Noty) new Noty({
            closeWith: ['click', 'button'],
            layout: 'topRight',
            progressBar: true,
            theme: 'semanticui',
            text: ReactDOMServer.renderToString(
                <Header>
                    {tt('forum_controls.submitted')}
                    <Header.Subheader>
                        {tt('forum_controls.submitted_desc')}
                    </Header.Subheader>
                </Header>
            ),
            type: 'success',
            timeout: 8000
        }).show();
        this.setState({
            topics: false,
            showNewPost: false,
        });
        setTimeout(() => {
            this.props.router.withQuery('__preloading', '1', false).push({
                scroll: false
            })
        }, 4000);
    };

    componentDidMount() {
        if (this.props.loading) {
            this.props.router.noQuery('__preloading').push({
                scroll: false
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const prevForumid = prevProps.router.query.forumid
        const { forumid } = this.props.router.query

        if (prevForumid !== forumid 
            || this.props.filter !== prevProps.filter
            || this.props.page !== prevProps.page
            || (this.props.topics && !prevProps.topics)) {
            this.setState({
                topics: this.props.topics,
            })
        }
        if (this.props.loading) {
            this.props.router.noQuery('__preloading').push({
                scroll: false
            })
        }
    }

    UNSAFE_componentWillMount() {
        this.props.actions.resetPostState();
    }

    changeVisibility = (e, data) => {
        this.setState({showModerated: data.checked}, () => {
            this.props.router
                .withQuery('filter', data.checked ? 'all' : null, false)
                .push({
                    scroll: false,
                })
            //this.getForum();
        });
    };

    removeTopic = (id) => {
        const topics = this.state.topics.filter((topic) => {
            return topic._id !== id;
        });
        this.setState({topics});
    };

    render() {
        let account = this.props.account,
            forum = this.props.forum,
            childForums = this.props.childForums || {},
            controls = false,
            display = false,
            subforums = false,
            page = this.props.page,
            isUser = this.props.account.isUser,
            perPage = $GLS_Config.forum.posts_per_page,
            posts = (forum && forum.stats) ? forum.stats.posts : 0,
            topics = this.state.topics;
        const { forumid } = this.props.router.query
        const childForums_cnt = Object.keys(childForums).length;
        if (childForums_cnt > 0) {
            let childs = [];
            for (let [_id, forum] of Object.entries(childForums)) {
                childs.push(<ForumIndex _id={_id} forum={forum} key={_id} />);
            }
            const panels = [
                {
                  key: 'subforums',
                  title: (
                      <Header
                          size='small'
                          key='subforums-title'
                          as={Accordion.Title}
                          content={tt('forum_controls.subcats') + `${childForums_cnt})`}
                          icon='fork'
                          onClick={this.toggleSubforums}
                          style={{marginBottom: 0}}
                      />
                  ),
                  content: {
                      active: this.state.showSubforums,
                      content: (
                          <Segment basic>
                              {childs}
                          </Segment>
                      ),
                      key: 'subforums'
                  },
                }
            ]
            subforums = (
                <Segment secondary attached='bottom'>
                    <Accordion panels={panels} />
                </Segment>
            );
        }
        if (forum) {
            controls = (
                <Segment basic vertical>
                    <ForumControls
                        changePage={this.changePage.bind(this)}
                        changeVisibility={this.changeVisibility.bind(this)}
                        isUser={isUser}
                        isBanned={!!forum.banned[account.name]}
                        page={page}
                        perPage={perPage}
                        posts={posts}
                        showModerated={this.state.showModerated}
                        showNewPost={this.showNewPost.bind(this)}
                    />
                </Segment>
            );
        }
        if (!this.props.loading && !!topics) {
            if (forum) {
                if (this.state.showNewPost) {
                    controls = false;
                    display = (
                        <PostForm
                            formHeader={(
                                <br/>
                            )}
                            forum={forum}
                            filter={this.state.filter}
                            elements={['body', 'title']}
                            onCancel={this.hideNewPost}
                            onComplete={this.handleNewPost}
                            target={this.props.forum}
                            { ... this.props } />
                    );
                } else {
                    if (topics.length > 0) {
                        display = (
                            <div>
                                <ForumPosts
                                    account={account}
                                    actions={this.props.actions}
                                    forum={forum}
                                    moderation={this.props.moderation}
                                    topics={topics}
                                    removeTopic={this.removeTopic.bind(this)}
                                />
                            </div>
                        );
                    } else {
                        display = (<ForumEmpty forum={forum} isUser={isUser} showNewPost={this.showNewPost} />);
                    }
                }
            } else {
                display = (<Forum404 />)
            }
        } else {
            display = (
                <Segment>
                    <Grid.Column width={16} style={{minHeight: '200px'}}>
                        <Dimmer inverted active style={{minHeight: '100px', display: 'block'}}>
                            <Loader size='large'/>
                        </Dimmer>
                    </Grid.Column>
                </Segment>
            )
        }
        let meta = false;
        if (forum && forumid) {
            const title = getPageTitle(getForumName(forum));
            const image = $GLS_Config.forum.meta_image;
            meta = (
                <Head>
                    <title>{title}</title>
                    <meta name='description' content={forum.desc_ru} />
                    <meta name='twitter:title' content={title} />
                    <meta name='twitter:description' content={forum.desc_ru} />
                    <meta name='twitter:image:src' content={image} />
                    <meta property='og:title' content={title} />
                    <meta property='og:description' content={forum.desc_ru} />
                    <meta property='og:image' content={image} />
                </Head>
            );
        }
        return (
            <div>
                {meta}
                {forum ? <ForumTitle
                    active={this.state.filter}
                    _id={forumid}
                    forum={forum}
                    account={account}
                    attached={(subforums) ? 'top' : false}
                    subforums={subforums}
                    { ... this.props } /> : null}
                {controls}
                <Segment basic vertical style={{padding: 0}}>
                    {display}
                </Segment>
                {controls}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        moderation: state.moderation,
        post: state.post,
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...breadcrumbActions,
        ...moderationActions,
        ...forumActions,
        ...postActions,
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ForumLayout));
