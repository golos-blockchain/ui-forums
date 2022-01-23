import React from 'react';
import Link from 'next/link';
import tt from 'counterpart';

export default class ForumLink extends React.Component {
    render() {
        const forum_name = (tt.getLocale() === 'ru') ? this.props.forum.name_ru : this.props.forum.name;
        return (<Link href={"/f/" + this.props._id}>{forum_name}</Link>);
    }
}
