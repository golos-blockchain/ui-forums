import React from 'react';
import tt from 'counterpart';

import { Button, Checkbox, Menu, Popup } from 'semantic-ui-react'

import Paginator from '@/elements/global/paginator'

export default class ForumControls extends React.Component {
    render() {
        const { forumid, isUser, isBanned, page, perPage, posts } = this.props;
        let newPostButton = (
                <Popup
                    trigger={
                        <Button floated='left' size='tiny'>
                            <i className='pencil icon'></i>
                            {tt('forum_controls.new_post')}
                        </Button>
                    }
                    position='bottom center'
                    inverted
                    content={isBanned ? 
                        tt('forum_controls.you_are_blocked') :
                        tt('forum_controls.you_must_be_logged_in_to_post')}
                    basic
                />
            )
        if (isUser && !isBanned) {
            newPostButton = (
                <Button floated='left' color='green' size='tiny' onClick={this.props.showNewPost}>
                    <i className='pencil icon'></i>
                    {tt('forum_controls.new_post')}
                </Button>
            );
        }
        return (
            <Menu fluid style={{border: 'none', boxShadow: 'none'}} attached size='small'>
                <Menu.Item>
                    {newPostButton}
                </Menu.Item>
                <Menu.Item className='mobile hidden'>
                    <Checkbox
                        label={tt('forum_controls.show_hidden')}
                        name='moderatedVisible'
                        onChange={this.props.changeVisibility}
                        checked={this.props.showModerated}
                    />
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Paginator
                            page={page}
                            perPage={perPage}
                            total={posts}
                            baseHref={`/f/${forumid}`}
                        />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        )
    }
}
