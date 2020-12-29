import React from 'react';
import tt from 'counterpart';

import { Button, Popup, Dropdown } from 'semantic-ui-react';

//import VoteButtonOptions from './vote/options';
import translateError from '../../../../utils/translateError';

import './voting.css';

export default class Voting extends React.Component {
    castVote = (e, data) => {
        let voter = this.props.account.name;
        let { author, permlink } = this.props.post;
        let weight = data.weight * 100;
        let myVote = null;
        if (this.props.post && this.props.post.active_votes) {
            for (let av of this.props.post.active_votes) {
                if (av.voter === voter && av.percent === weight) {
                    myVote = av;
                    break;
                }
            }
        }
        if (myVote) {
            this.props.onVoteCast({
                account: this.props.account,
                author: author,
                permlink: permlink,
                weight: 0
            });
        } else {
            this.props.onVoteCast({
                account: this.props.account,
                author: author,
                permlink: permlink,
                weight: weight
            });
        }
    }

    openVoter = (e, data) => {
        let win = window.open('/@' + data.text, '_blank');
        win.focus();
    }

    render() {
        if (this.props.error) {
            alert(translateError('vote', this.props.error));
            this.props.clearVoteError();
        }
        let { account, post } = this.props;
        // Is there an active vote by this account?
        let myVote = null;
        let netVotes = post.net_votes;
        let votes = [];
        if (post && post.active_votes) {
            for (let av of post.active_votes) {
                if (av.percent === 0) continue;
                if (av.voter === account.name) {
                    myVote = av;
                }
                votes.push(<Dropdown.Item key={av.voter} text={av.voter} description={(av.percent/100) + '%'} onClick={this.openVoter}/>);
            }
        }
        if (votes.length && votes.length < post.active_votes_count) {
            votes.push(<Dropdown.Header content={tt('voting.has_more_VOTES', {VOTES: post.active_votes_count - votes.length})} />);
        }

        const iUpvoted = myVote && myVote.percent > 0;
        const iDownvoted = myVote && myVote.percent < 0;
        // -----------------------------
        // Button Properties
        let onClick = this.castVote;
        // Placeholder button until user is recognized / logged in
        let display = (
            <div>
                <Popup
                    trigger={
                        <Button floated='left' basic icon='thumbs up'>
                        </Button>
                    }
                    position='bottom center'
                    inverted
                    content={tt('voting.you_must_be_logged_in_to_vote')}
                    basic
                />
                <Dropdown
                    floating
                    className="VoteList"
                    text={netVotes.toString()}
                    icon={null}>
                    <Dropdown.Menu>
                        {votes}
                    </Dropdown.Menu>
                </Dropdown>
                <Popup
                    trigger={
                        <Button floated='left' basic icon='thumbs down'>
                        </Button>
                    }
                    position='bottom center'
                    inverted
                    content={tt('voting.you_must_be_logged_in_to_vote')}
                    basic
                />
            </div>
        );
        // If an error has occured, change text/tooltip and set active
        if (this.props.error) {
            myVote = null;
        }
        // If an account exists, setup the actual button
        if (this.props.account.isUser) {
            //const { voting_power } = this.props.account.data || 10000;
            /*adjuster = (
                <VoteButtonOptions
                    account={this.props.account}
                    status={this.props.status}
                    effectiveness={`${voting_power / 100}%`}
                    onWeightChange={this.props.onWeightChange}
                    weight={weight}/>
            )*/
            // Set the display
            display = (<div>
                <span>
                    <Button
                        onClick={onClick}
                        weight={100}
                        disabled={this.props.loading}
                        basic={!iUpvoted}
                        icon='thumbs up'
                        color={'green'}
                        floated='left'
                    />
                </span>
                <span>
                    <Dropdown
                        floating
                        className="VoteList"
                        loading={this.props.loading}
                        text={this.props.loading ? '' : netVotes.toString()}
                        icon={this.props.loading ? '' : null}>
                        <Dropdown.Menu>
                          {votes}
                        </Dropdown.Menu>
                    </Dropdown>
                </span>
                <span>
                    <Button
                        onClick={onClick}
                        weight={-100}
                        disabled={this.props.loading}
                        basic={!iDownvoted}
                        icon='thumbs down'
                        color={'red'}
                        floated='left'
                    />
                </span>
                </div>
            );
        };
        return display;
    }
}
