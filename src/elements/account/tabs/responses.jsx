import React from 'react';
import { goToTop } from 'react-scrollable-anchor';

import { Grid, Segment } from 'semantic-ui-react';

import AccountResponse from '@/elements/account/tabs/types/response';
import Paginator from '@/elements/global/paginator';

export default class AccountResponses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
        };
    }

    changePage = (page) => {
        this.setState({
            page: page,
            responses: []
        });
        //this.props.actions.fetchPostResponsesByAuthor(this.state.username, page);
        goToTop();
    };

    render() {
        let total = 0
        let content = (<Segment attached padded='very' loading style={{margin: '2em 0'}} />);
        const { post } = this.props;
        const { username } = this.props.router.query
        if (post.authors && post.authors[username] && post.authors[username].responses) {
            const { responses, totalResponses, } = post.authors[username];
            total = totalResponses
            if (responses) {
                content = responses.map((topic, idx) => (<AccountResponse topic={topic} key={idx} {... this.props} />));
            }
        }
        return (
            <Segment attached>
                {content}
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>

                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Paginator
                                page={this.state.page}
                                perPage={100}
                                total={total}
                                callback={this.changePage}
                                />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }
}
