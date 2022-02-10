import React, { Component } from 'react'
import tt from 'counterpart';
import Pagination from 'rc-pagination';
import localeEn from 'rc-pagination/lib/locale/en_US';
import localeRu from 'rc-pagination/lib/locale/ru_RU';

import 'rc-pagination/assets/index.css'

import Link from '@/elements/link'
import { withRouter } from '@/utils/withRouter'

const defaultBuildHref = (baseHref, current) => {
    if (current === 0 || current === 1) {
        return baseHref
    }
    return baseHref + '/' + current
}

class Paginator extends Component {
    changePage = (page) => {
        if (this.props.baseHref) {
            const href = this.buildHref(page)
            const hrefAs = this.buildAs(page, href)

            if (href !== this.props.router.asPath) {
                this.props.router
                    .withQuery('__preloading', '1', false)
                    .toUrl(href)
                    .toUrl(hrefAs, false)
                    .push({
                        scroll: false
                    })
            }
        }
        if (this.props.callback)
            this.props.callback(page, `comments-page-${page}`);
    };

    buildHref = (page) => {
        let { baseHref, onBuildHref } = this.props
        if (!onBuildHref) {
            onBuildHref = defaultBuildHref
        }
        const href = onBuildHref(baseHref, page)
        return href
    }

    buildAs = (page, href) => {
        const { baseHref, onBuildAs } = this.props
        let hrefAs
        if (!onBuildAs) {
            hrefAs = href
        } else {
            hrefAs = onBuildAs(baseHref, page)
        }
        return hrefAs
    }

    itemRender = (current, type, element) => {
        let { baseHref } = this.props
        if (!baseHref) {
            return element
        }

        const href = this.buildHref(current)
        const hrefAs = this.buildAs(current, href)

        if (href === this.props.router.asPath) {
            return element
        }

        return <Link href={href} as={hrefAs} scroll={false}>{element}</Link>
    }

    render() {
        let { page, perPage, total } = this.props;
        return (
            <Pagination
                showLessItems={this.props.showMorePages ? undefined : true}
                defaultPageSize={perPage}
                itemRender={this.itemRender}
                current={page}
                onChange={this.changePage}
                total={total}
                style={{ float: 'right', margin: 0 }}
                locale={tt.getLocale() === 'ru' ? localeRu : localeEn}
            />
        );
    }
}

export default withRouter(Paginator)
