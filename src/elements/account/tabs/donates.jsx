import React from 'react';
import Link from 'next/link'
import { goToTop } from 'react-scrollable-anchor';
import tt from 'counterpart';

import { Grid, Segment, Table } from 'semantic-ui-react';

import AccountLink from '@/elements/account/link';
import Paginator from '@/elements/global/paginator';
import TimeAgoWrapper from '@/utils/TimeAgoWrapper';

export default class AccountDonates extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
        };
    }

    changePage = (page) => {
        this.setState({
            page: page,
        });
        //this.props.actions.fetchDonatesByAuthor(this.state.username, this.props.direction, page);
        goToTop();
    };

    _renderDonate = (op) => {
        const item = op[1].op[1];

        let actorDesc = this.props.direction === 'from' ? tt('account.to') : tt('account.from');
        let actor = this.props.direction === 'from' ? item.to : item.from;
        let actorBanned = this.props.direction === 'from' ? op[1].to_banned : op[1].from_banned;

        let target = item.memo.target;
        if (target.permlink) {
            let author = '@' + target.author;
            let url = author + '/' + target.permlink;

            if (target._root_permlink) {
                let root_author = '@' + target._root_author;
                url = root_author + '/' + target._root_permlink + '#' + url;
            }

            url = '/' + op[1]._category + '/' + url;
            target = (<span>
                {tt('account.for')}
                <Link href={url}>{url}</Link>
            </span>);
        }

        return (<Table.Row key={op[1].trx_id + '.' + op[1].op_in_trx}>
            <Table.Cell><TimeAgoWrapper date={`${op[1].timestamp}Z`} /></Table.Cell>
            <Table.Cell>
                {item.amount}
                {actorDesc}
                <AccountLink
                    noPopup={true}
                    username={actor}
                    isBanned={actorBanned}
                />
                {target}
            </Table.Cell>
            <Table.Cell>{item.memo.comment}</Table.Cell>
        </Table.Row>);
    }

    render() {
        let total = 0
        let content = (<Segment attached padded='very' loading style={{margin: '2em 0'}} />);
        const { post } = this.props;
        const { username } = this.props.router.query
        if (post.authors && post.authors[username] && post.authors[username].donates) {
            const { donates, totalDonates } = post.authors[username];
            total = totalDonates
            if (donates) {
                content = donates.map(op => this._renderDonate(op)).reverse()
            }
        }
        return (
            <Segment attached>
                {content && content.length ? <Table textAlign='left'>
                    <Table.Body>
                        {content}
                    </Table.Body>
                </Table> : null}
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>

                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Paginator
                                page={this.state.page}
                                perPage={$GLS_Config.forum.account_donates_per_page}
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
