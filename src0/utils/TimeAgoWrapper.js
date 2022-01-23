import React from 'react';
import tt from 'counterpart';
import TimeAgo from 'react-timeago';
import ruStrings from 'react-timeago/lib/language-strings/ru';
import enStrings from 'react-timeago/lib/language-strings/en';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

export default class TimeAgoWrapper extends React.Component {
    render() {
        let formatter = null;
        if (tt.getLocale() === 'ru') {
            formatter = buildFormatter(ruStrings);
        } else {
            formatter = buildFormatter(enStrings);
        }
        const { prefix } = this.props;
        if (prefix) {
            let origFormatter = formatter;
            formatter = function(value, unit, suffix, then, nextFormatter, now) {
                return prefix + origFormatter(value, unit, suffix, then, nextFormatter, now)
            };
        }
        return (<TimeAgo {...this.props} formatter={formatter} />);
    }
}
