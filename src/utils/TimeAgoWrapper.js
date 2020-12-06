import React from 'react';

import TimeAgo from 'react-timeago'
import ruStrings from 'react-timeago/lib/language-strings/ru'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

export default class TimeAgoWrapper extends React.Component {
  render() {
    const formatter = buildFormatter(ruStrings);
    return (<TimeAgo {...this.props} formatter={formatter} />);
  }
}