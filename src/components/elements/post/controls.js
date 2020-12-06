import React from 'react';

import { Segment } from 'semantic-ui-react'

import Voting from './button/voting'

export default class PostControls extends React.Component {

  castVote = (payload) => {
    const id = [payload.author, payload.permlink].join("/")
    this.props.actions.setVoteProcessing(id)
    this.props.actions.castVote(payload)
  }

  clearVoteError = (payload) => {
    this.props.actions.clearVoteError(payload)
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
        error={(processing.errors[postId] ? processing.errors[postId] : false)}
        onWeightChange={this.props.actions.setPreference}
        clearVoteError={this.clearVoteError}
        onVoteCast={this.castVote}
      />
    )
    if (this.props.onlyButton) {
      return voting
    }
    return (
      <Segment secondary basic clearing attached textAlign='right'>
        {voting}
        {this.props.editButton}
        {this.props.postButton}
      </Segment>
    )
  }
}
