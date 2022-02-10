import React from 'react'
import { withRouter } from 'next/router'

class Link extends React.Component {
    linkClicked = (e, href, as, replace, shallow, scroll, preloading) => {
        e.preventDefault()
        let newHref = href
        if (preloading) {
            if (newHref.includes('?')) {
                newHref += '&__preloading=1'
            } else {
                newHref += '?__preloading=1'
            }
        }
        this.props.router[replace ? 'replace' : 'push'](newHref,
            as || href,
            {
                scroll,
                shallow
            })
    }

    render() {
        let { children,
            href, as, replace, shallow, scroll, preloading, } = this.props
        if (typeof children === 'string') {
            children = <a>{children}</a>
        }
        let child = React.Children.only(children)
        if (preloading === undefined) {
            preloading = true
        }
        const childProps = {
            onClick: (e) => {
                if (child.props && typeof child.props.onClick === 'function') {
                    child.props.onClick(e)
                }
                if (!e.defaultPrevented) {
                    this.linkClicked(e, href, as, replace, shallow, scroll, preloading)
                }
            },
        }
        if (this.props.passHref || (child.type === 'a' && !('href' in child.props))) {
            childProps.href = href
        }
        return React.cloneElement(child, childProps)
    }
}

export default withRouter(Link)
