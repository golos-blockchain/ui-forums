import React from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'

import { Dimmer, Grid, Loader } from 'semantic-ui-react'

import * as accountActions from '@/actions/accountActions'
import * as chainstateActions from '@/actions/chainstateActions'
import * as postActions from '@/actions/postActions'

import PostContent from '@/elements/post/content'

//import "./post/styles.css"

class Post extends React.Component {

  render() {
    let display = (
          <Grid.Column only='tablet computer' width={16}>
            <Dimmer inverted active style={{minHeight: '100px', display: 'block'}}>
              <Loader size='large' />
            </Dimmer>
          </Grid.Column>
        )
    if(this.props.post.content) {
      display = (
        <Grid.Column mobile={16} tablet={16} computer={16}>
          <PostContent
            op={true}
            content={this.props.post.content}
            { ...this.props } />
        </Grid.Column>
      )
    }
    return(
            <div id={this.props.post.content._id}>
              <Grid>
                <Grid.Row>
                  {display}
                </Grid.Row>
              </Grid>
            </div>
          );
  }

}

function mapStateToProps(state, ownProps) {
  return {
    account: state.account,
    post: ownProps.post || state.post,
  }
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators({
    ...accountActions,
    ...chainstateActions,
    ...postActions,
  }, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(Post);
