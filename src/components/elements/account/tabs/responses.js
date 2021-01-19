import React from 'react';
import { goToTop } from 'react-scrollable-anchor';

import { Grid, Segment } from 'semantic-ui-react';

import AccountResponse from './types/response';
import Paginator from '../../../global/paginator';

export default class AccountResponses extends React.Component {
    constructor(props) {
        super(props);
        const { post } = props;
        const { username } = props.match.params;
        this.state = {
            page: 1,
            post,
            responses: [],
            totalResponses: 0,
            username
        };
        props.actions.fetchPostResponsesByAuthor(username);
        this.changePage = this.changePage.bind(this);
    }

    changePage = (page) => {
        this.setState({
            page: page,
            responses: []
        });
        this.props.actions.fetchPostResponsesByAuthor(this.state.username, page);
        goToTop();
    };

    componentWillReceiveProps(nextProps) {
        const { username } = this.state;
        const { post } = nextProps;
        if (post.authors && post.authors[username] && post.authors[username].responses) {
            const { responses, totalResponses } = post.authors[username];
            let content = false;
            if (responses) {
                content = responses.map((topic, idx) => (<AccountResponse topic={topic} key={idx} {... this.props} />));
            }
            this.setState({ content, responses, totalResponses });
        }
    }

    render() {
        const { totalResponses } = this.state;
        let { content } = this.state;
        if (!content) content = (<Segment attached padded='very' loading style={{margin: '2em 0'}} />);
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
                                total={totalResponses}
                                callback={this.changePage}
                                />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }
}
