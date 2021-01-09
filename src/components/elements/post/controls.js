import React from 'react';

import { Segment } from 'semantic-ui-react'

import Voting from './button/voting'
import Donating from './button/donating'

export default class PostControls extends React.Component {

    castVote = (payload) => {
        const id = [payload.author, payload.permlink].join("/");
        this.props.actions.setVoteProcessing(id);
        this.props.actions.castVote(payload);
    }

    clearVoteError = (payload) => {
        this.props.actions.clearVoteError(payload);
    }

    clearDonateError = (payload) => {
        this.props.actions.clearDonateError(payload);
    }

    castDonate = (payload) => {
        const id = [payload.author, payload.permlink].join("/");
        this.props.actions.setDonateProcessing(id);
        this.props.actions.castDonate(payload);
    }

    fetchPostDonates = (payload) => {
        this.props.actions.fetchPostDonates(payload);
    }

    fetchAccount = (payload) => {
        this.props.actions.fetchAccount(payload);
    }

  render() {
    let data = this.props.post
    let post = this.props.target
    let processing = data.processing
    let postId = post.author + '/' + post.permlink
    const voting = (
      <Voting
        account={this.props.account}
        status={this.props.status}
        post={post}
        loading={(processing.votes.indexOf(postId) !== -1)}
        error={(processing.errors['vote-'+postId] ? processing.errors['vote-'+postId] : false)}
        onWeightChange={this.props.actions.setPreference}
        clearVoteError={this.clearVoteError}
        onVoteCast={this.castVote}
      />
    )
    const donating = (
      <Donating
        account={this.props.account}
        status={this.props.status}
        post={post}
        error={(processing.errors['donate-'+postId] ? processing.errors['donate-'+postId] : false)}
        clearDonateError={this.clearDonateError}
        onDonateCast={this.castDonate}
        fetchPostDonates={this.fetchPostDonates}
        fetchAccount={this.fetchAccount}
      />
    )
    if (this.props.onlyButton) {
      return voting
    }
    return (
      <Segment secondary basic clearing attached textAlign='right'>
        {voting}
        {this.props.editButton}
        {this.props.quoteButton}
        {this.props.postButton}
        {donating}
      </Segment>
    )
  }
}
