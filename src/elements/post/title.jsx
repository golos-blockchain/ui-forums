import React from 'react';

import { Grid, Header, Icon, Segment } from 'semantic-ui-react';

import TimeAgoWrapper from '@/utils/TimeAgoWrapper';
import AccountAvatar from '@/elements/account/avatar';
import AccountLink from '@/elements/account/link';

export default class PostTitle extends React.Component {
    log10(str) {
        const leadingDigits = parseInt(str.substring(0, 4), 10);
        const log = Math.log(leadingDigits) / Math.LN10 + 0.00000001;
        const n = str.length - 1;
        return n + (log - parseInt(log, 10));
    }

    repLog10 = rep2 => {
        if (rep2 == null) return rep2;
        let rep = String(rep2);
        const neg = rep.charAt(0) === '-';
        rep = neg ? rep.substring(1) : rep;

        let out = this.log10(rep);
        if (isNaN(out)) out = 0;
        out = Math.max(out - 9, 0); // @ -9, $0.50 earned is approx magnitude 1
        out *= (neg ? -1 : 1);
        out = (out * 9) + 25; // 9 points per magnitude. center at 25
        // base-line 0 to darken and < 0 to auto hide (grep rephide)
        out = parseInt(out, 10);
        return out;
    };

    render() {
        const { content, account } = this.props;
        const withMsgsButton = (account && account.name && account.name !== content.author) || (!account || !account.name);
        let rootTitle = false;
        if (this.props.op) {
            rootTitle = (
                <Segment inverted color='blue' attached stacked={(this.props.page !== 1)}>
                    <Header size='large'>
                        <Icon name='comments' />
                        <Header.Content as='h1'>
                                {content.title}
                        </Header.Content>
                    </Header>
                </Segment>
            );
        }
        return (
            <div>
                {rootTitle}
                <Segment secondary attached>
                    <Grid>
                        <Grid.Row verticalAlign='top'>
                            <Grid.Column tablet={8} computer={8} mobile={14}>
                                <Header size='medium'>
                                    <AccountAvatar username={content.author} />
                                    <AccountLink username={content.author}
                                        reputation={this.repLog10(content.author_reputation)}
                                        isBanned={content.author_banned}
                                        withMsgsButton={withMsgsButton} />
                                    <Header.Subheader>
                                        {'↳ '}
                                        <a href={!this.props.op ? ('#@' + content.author + '/' + content.permlink) : '#'}><TimeAgoWrapper date={`${content.created}Z`} live={false} /></a>
                                    </Header.Subheader>
                                </Header>
                            </Grid.Column>
                            <Grid.Column tablet={8} computer={8} mobile={4} textAlign='right' verticalAlign='middle'>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        );
    }
}
