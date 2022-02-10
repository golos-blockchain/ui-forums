import React from 'react';

import { Grid, Segment } from 'semantic-ui-react';

// import AccountAvatar from '@/elements/account/avatar';
import ForumPost from '@/elements/forum/post';
import Paginator from '@/elements/global/paginator';

export default class AccountPosts extends React.Component {
    constructor(props) {
        super(props);
        const page = 1;
        this.state = { page };
    }

    changePage = (page) => {
        this.setState({
            page: page
        });
        //this.props.actions.fetchPostByAuthor(this.state.username, page);
    };

    render() {
        const { username } = this.props.router.query
        let content = (<Segment attached padded='very' loading />);
        if (this.props && this.props.post && this.props.post.authors && this.props.post.authors[username] && this.props.post.authors[username].posts) {
            const { authors } = this.props.post;
            const { posts, totalPosts, moders, supers, hidden, banned } = authors[username];
            content = (
                <Segment attached>
                    {posts.map((topic, idx) => {
                        const forum = {
                            _id: topic.forum._id,
                            name_ru: topic.forum.forum.name_ru,
                            name: topic.forum.forum.name,
                            trail: topic.forum.forum.trail,
                            moders, supers, hidden, banned
                        };
                        return (<ForumPost showForumName={true} topic={topic} key={idx}
                            forum={forum} account={this.props.account} actions={this.props.actions} />);
                    })}
                    <br />
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={8}>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Paginator
                                    page={this.state.page}
                                    perPage={20}
                                    total={totalPosts}
                                    callback={this.changePage}
                                    />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            );
        }
        return content;
    }
}
