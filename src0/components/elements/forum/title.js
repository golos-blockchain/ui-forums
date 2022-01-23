import React from 'react';
import { Link } from 'react-router-dom';
import tt from 'counterpart';

import { Grid, Header, Icon, Segment } from 'semantic-ui-react'

export default class ForumTitle extends React.Component {
    changeFilter = (e, data) => {
        const tag = (data.value) ? data.value : false;
        this.setState({ active: tag });
        this.props.changeFilter(tag);
        this.props.hideConfig();
    };

    render() {
        let { _id, forum } = this.props;
        //let tags = false;
        //let parent = false;
        if (forum) {
            /*if(forum.tags) {
              tags = forum.tags.map((tag, i) => (
                  <Menu.Item key={i} value={tag} onClick={this.changeFilter} active={(this.props.active === tag)}>
                      #{tag}
                  </Menu.Item>
              ))
            }*/
            /*if (forum.parent) {
                parent = (
                    <Popup
                      trigger={
                          <Menu.Item icon as={Link} to={`/f/${forum.parent}`}>
                              <Icon name='chevron up' size='large' />
                          </Menu.Item>
                      }
                      content='Go to Parent Forum'
                      inverted
                    />
                );
            }*/
        }
        return (
            <div>
                <Segment attached='top' color='blue' inverted stacked>
                    <Grid stackable>
                        <Grid.Row>
                            <Grid.Column width={14}>
                                <Header size='huge' key={(forum) ? _id : 'unknown'} style={{color: 'white'}}>
                                    <Icon name='list' />
                                    <Header.Content>
                                        {(forum) ? ((tt.getLocale() === 'ru') ? forum.name_ru : forum.name) : 'unknown'}
                                        <Header.Subheader style={{color: 'white'}}>
                                            <small>
                                                {' • '}
                                                <Link to={`/f/${(forum) ? _id : 'unknown'}`} style={{color: 'white'}}>
                                                    /f/{(forum) ? _id : 'unknown'}
                                                </Link>
                                                {/*{' • '}
                                                {tt('forum_controls.created_by')}
                                                {' '}
                                                <AccountLink username={(forum) ? forum.creator || 'chainbb' : 'unknown'} color='white' />*/}
                                                <div dangerouslySetInnerHTML={{__html: tt.getLocale() === 'ru' ? forum.desc_ru : forum.desc}}></div>
                                            </small>
                                        </Header.Subheader>
                                    </Header.Content>
                                </Header>
                            </Grid.Column>
                            {/*<Grid.Column width={2}>
                                <Popup
                                  trigger={
                                      <Button
                                          rounded
                                          disabled={!forum}
                                          size='large'
                                          floated='right'
                                          icon='cubes'
                                          onClick={this.props.showConfig}
                                      />
                                  }
                                  content='Forum Information'
                                  inverted
                                />
                            </Grid.Column>*/}
                        </Grid.Row>
                    </Grid>
                </Segment>
                {(forum && forum.description)
                    ? (
                        <Segment attached>
                            {forum.description}
                        </Segment>
                    )
                    : false
                }
                {/*<Menu attached={(this.props.subforums) ? true : 'bottom'} color='blue' size='tiny'>
                    <Menu.Item icon value={false} key={(forum) ? _id : 'unknown'} onClick={this.changeFilter} active={(this.props.active === false)}>
                        <Icon name='home' size='large' color='blue' />
                    </Menu.Item>
                    {parent}
                    {tags}
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <ForumSubscribe
                              forum={this.props.forum}
                              isUser={this.props.account.isUser}
                              subscriptions={this.props.subscriptions.forums}
                              onSubscribe={this.props.actions.forumSubscribe}
                              onUnsubscribe={this.props.actions.forumUnsubscribe}
                            />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>*/}
                {this.props.subforums}
            </div>
        );
    }
}
