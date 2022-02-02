import React from 'react'
import Link from '@/elements/link'
import tt from 'counterpart'

import { Grid, Header, Icon, Segment } from 'semantic-ui-react'

export default class ForumTitle extends React.Component {
    render() {
        let { _id, forum } = this.props;
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
                                                <Link href={`/f/${(forum) ? _id : 'unknown'}`} style={{color: 'white'}}>
                                                    <span>/f/{(forum) ? _id : 'unknown'}</span>
                                                </Link>
                                                <div dangerouslySetInnerHTML={{__html: 
                                                    (forum) ? (tt.getLocale() === 'ru' ? forum.desc_ru : forum.desc) : 'unknown'
                                                }}></div>
                                            </small>
                                        </Header.Subheader>
                                    </Header.Content>
                                </Header>
                            </Grid.Column>
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
                {this.props.subforums}
            </div>
        );
    }
}
