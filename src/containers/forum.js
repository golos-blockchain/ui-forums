import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { goToTop } from 'react-scrollable-anchor';
import ReactDOMServer from 'react-dom/server';
import tt from 'counterpart';
import fetch from 'cross-fetch';

import { Accordion, Dimmer, Grid, Header, Icon, Loader, Message, Segment } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as breadcrumbActions from '../actions/breadcrumbActions';
import * as forumActions from '../actions/forumActions';
import * as moderationActions from '../actions/moderationActions';
import * as subscriptionActions from '../actions/subscriptionActions';
import * as postActions from '../actions/postActions';
import * as statusActions from '../actions/statusActions';

import ForumControls from '../components/elements/forum/controls';
import ForumManage from './forum/manage';
import ForumIndex from '../components/elements/forum/index';
import ForumTitle from '../components/elements/forum/title';
import Forum404 from '../components/elements/forum/404';
import ForumPosts from '../components/elements/forum/posts';
import PostForm from './post/form';
import { getForumName, getPageTitle } from '../utils/text';

import importNoty from '../utils/importNoty';

const configSections = ['overview', 'upgrades', 'permissions', 'configuration'];

class Forum extends React.Component {
  constructor(props, state) {
      if (process.browser) goToTop();
      const hash = props.history.location.hash.replace('#', '');
      super(props, state);
      this.state = {
          children: props.children || {},
          loadingPosts: !props.topics,
          page: 1,
          topics: props.topics || false,
          filter: (hash) ? hash : false,
          newForum: false,
          showConfig: (['overview', 'upgrades', 'permissions', 'configuration'].indexOf(props.section) >= 0) ? true : false,
          showNewPost: false,
          showModerated: false,
          showSubforums: true,
          forum: {
              banned: {}
          }
      };
      this.getForum = this.getForum.bind(this);
  }

  changePage = (page) => this.setState({ page: page }, () => this.getForum(page));
  showNewPost = () => this.setState({ page: 1, showNewPost: true });
  hideNewPost = (e) => this.setState({ showNewPost: false });
  showConfig = () => {
      if (!this.state.showConfig && this.props.forumid) {
          this.setState({showConfig: true})
          this.props.history.push(`/f/${this.props.forumid}/overview`);
      }
  };
  hideConfig = () => {
      if (this.state.showConfig && this.props.forumid) {
          this.setState({showConfig: false})
          this.props.history.push(`/f/${this.props.forumid}`);
          this.getForum()
      }
  };
  toggleConfig = () => (this.state.showConfig) ? this.hideConfig() : this.showConfig();
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
          loadingPosts: true
      });
      if (process.browser) setTimeout(() => {
          this.getForum(1);
      }, 4000);
  };

  componentDidUpdate(prevProps, prevState) {
      if (prevProps.forumid !== this.props.forumid) {
          this.getForum(1);
      }
      if (prevProps.section !== this.props.section) {
          this.setState({
              showConfig: (configSections.indexOf(this.props.section) >= 0) ? true : false,
          });
      }
      let hash = this.props.location.hash.replace('#', '');
      if (!hash) hash = false;
      if (hash !== this.state.filter) {
          this.setState({
              filter: hash,
          }, this.getForum);
      }
  }

  componentWillMount() {
      this.props.actions.resetPostState();
  }

  componentDidMount() {
      this.getForum();
  }

  setForum = (forumRaw, moders, supers, hidden, banned) => {
      let forum = Object.assign({moders, supers, hidden, banned}, forumRaw);
      this.setState({forum});
      this.props.actions.setForum(forum);
  };

  setBreadcrumb = (result) => {
      if (result.forum) {
          let trail = result.forum.trail.map(item => {
              return {
                  name: getForumName(item),
                  link: `/f/${item._id}`
              };
          });
          this.props.actions.setBreadcrumb(trail);
      }
  };
  completeReservation = () => {
      this.setState({
          newForum: true,
          reservation: false,
          filter: 'configuration',
          showConfig: true
      }, () => {
          this.props.history.push(`/f/${this.props.forumid}/configuration`);
          this.getForum();
      });
  };

  changeFilter = (data) => {
      let filter = data;
      if (filter === 'false') {
          filter = false;
      }
      const hash = this.props.history.location.hash.replace('#', '');
      if (filter && filter !== hash) {
          this.props.history.push(`/f/${this.props.forumid}#${filter}`);
      } else if (hash) {
          this.props.history.push(`/f/${this.props.forumid}`);
      }
  };

  async getForum(page = false) {
      this.setState({
          topics: false,
          showNewPost: false,
          loadingPosts: true
      });
      if (!page) page = this.state.page;
      try {
          const { forumid } = this.props;
          let url = `${ CONFIG.rest_api }/forum/${ forumid }?page=${ page }`;
          if (this.state.showModerated) {
              url += `&filter=all`;
          } else if (this.state.filter && this.state.filter !== 'false') {
              url += `&filter=${this.state.filter}`;
          }
          const response = await fetch(url)
          if (response.ok) {
              const result = await response.json()
              this.props.actions.setStatus({'network': result.network});
              this.setForum(result.forum, result.moders, result.supers, result.hidden, result.banned)
              this.setBreadcrumb(result)

              // If a valid forum is found
              if (result.status === 'ok') {
                  // and we have data
                  if (result.data && (!result.meta || result.meta.configured !== false)) {
                      // display the forum
                      this.setState({
                          loadingPosts: false,
                          children: result.children,
                          topics: result.data
                      });
                  }
                  // if we are returned the configured flag as false
                  if (result.meta && result.meta.configured === false) {
                      // display the config panel
                      this.setState({
                          loadingPosts: false,
                          showConfig: true,
                      });
                  }
              }
              // If this forum is not found, but we have a reservation
              if (result.status === 'not-found') {
                  // show the reservation
                  this.setState({
                      reservation: result.meta.reservation,
                      loadingPosts: false
                  });
              }
          } else {
              console.error(response.status);
          }
      } catch(e) {
          console.error(e);
      }
  }

  changeVisibility = (e, data) => {
      this.setState({showModerated: data.checked}, () => {
          this.getForum();
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
          forumid = this.props.forumid,
          forum = this.state.forum,
          reservation = this.state.reservation,
          children = this.state.children || {},
          controls = false,
          display = false,
          subforums = false,
          page = this.state.page,
          isUser = this.props.account.isUser,
          perPage = CONFIG.forum.posts_per_page,
          posts = (forum && forum.stats) ? forum.stats.posts : 0,
          topics = this.state.topics;
      const children_cnt = Object.keys(children).length;
      if (children_cnt > 0) {
          let childs = [];
          for (let [_id, forum] of Object.entries(children)) {
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
                        content={tt('forum_controls.subcats') + `${children_cnt})`}
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
      if (!this.state.loadingPosts) {
          if (forum) {
              if (this.state.showConfig) {
                controls = false;
                display = (
                    <ForumManage
                        account={account}
                        hideConfig={this.hideConfig.bind(this)}
                        forum={forum}
                        newForum={this.state.newForum}
                        section={this.props.section}
                        target={this.state.forum}
                    />
                );
              } else if (this.state.showNewPost) {
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
                          target={this.state.forum}
                          { ... this.props } />
                  );
              } else {
                  if (topics.length > 0) {
                      display = (
                          <div>
                              <ForumPosts
                                  account={account}
                                  actions={this.props.actions}
                                  changeFilter={this.changeFilter.bind(this)}
                                  forum={forum}
                                  moderation={this.props.moderation}
                                  topics={topics}
                                  removeTopic={this.removeTopic.bind(this)}
                              />
                          </div>
                      );
                  } else if (this.state.loadingPosts) {
                      display = (
                          <Grid.Column width={16} style={{minHeight: '200px'}}>
                              <Dimmer inverted active style={{minHeight: '100px', display: 'block'}}>
                                  <Loader size='large'/>
                              </Dimmer>
                          </Grid.Column>
                      );
                  } else {
                      display = (<Forum404 forum={forum} isUser={isUser} showNewPost={this.showNewPost} />);
                  }
              }
          } else if (this.state.reservation) {
              display = (
                  <ForumManage
                      status={this.props.status}
                      reservation={this.state.reservation}
                      completeReservation={this.completeReservation.bind(this)}
                  />
              );
          } else {
            display = <Segment basic>
                <Message
                    warning
                    header='Was this forum recently requested?'
                    content='If this forum was created within the last few minutes, please wait a moment and then refresh the page to try again.'
                />
                <Segment padded textAlign='center'>
                    <Icon name='warning' size='huge' />
                    <Header>
                        A forum at this URL does not yet exist
                        <Header.Subheader>
                            Please check the URL and try again.
                        </Header.Subheader>
                    </Header>
                </Segment>
            </Segment>
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
          const image = CONFIG.forum.meta_image;
          meta = (
              <Helmet>
                  <title>{title}</title>
                  <meta name='description' content={forum.desc_ru} />
                  <meta name='twitter:title' content={title} />
                  <meta name='twitter:description' content={forum.desc_ru} />
                  <meta name='twitter:image:src' content={image} />
                  <meta property='og:title' content={title} />
                  <meta property='og:description' content={forum.desc_ru} />
                  <meta property='og:image' content={image} />
              </Helmet>
          );
      }
      return (
          <div>
              {meta}
              <ForumTitle
                  active={this.state.filter}
                  _id={forumid}
                  forum={forum || reservation}
                  account={account}
                  attached={(subforums) ? 'top' : false}
                  changeFilter={this.changeFilter.bind(this)}
                  hideConfig={this.hideConfig}
                  history={this.props.history}
                  showConfig={this.showConfig}
                  subforums={(this.state.showConfig) ? false : subforums}
                  { ... this.props } />
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
        status: state.status,
        subscriptions: state.subscriptions
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...breadcrumbActions,
        ...moderationActions,
        ...forumActions,
        ...postActions,
        ...statusActions,
        ...subscriptionActions,
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Forum));
