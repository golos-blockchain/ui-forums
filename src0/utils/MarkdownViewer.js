import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Remarkable from 'remarkable';
import hljs from 'highlight.js';
import sanitize from 'sanitize-html';

import { Embed } from 'semantic-ui-react';

import sanitizeConfig, { noImageText } from './sanitizeConfig';
import HtmlReady from '../shared/HtmlReady';

const remarkable = new Remarkable('full', {
    html: true, // remarkable renders first then sanitize runs...
    breaks: true,
    langPrefix: 'hljs language-',  // CSS language prefix for fenced blocks
    linkify: false, // linkify is done locally
    typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
    quotes: '“”‘’',
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }

        try {
            return hljs.highlightAuto(str).value;
        } catch (__) {}

        return '';
    },
});



class MarkdownViewer extends React.Component {

    static propTypes = {
        // HTML properties
        text: PropTypes.string,
        className: PropTypes.string,
        large: PropTypes.bool,
        // formId: PropTypes.string, // This is unique for every editor of every post (including reply or edit)
        canEdit: PropTypes.bool,
        jsonMetadata: PropTypes.object,
        highQualityPost: PropTypes.bool,
        noImage: PropTypes.bool,
        allowDangerousHTML: PropTypes.bool,
    };

    static defaultProps = {
        className: '',
        large: false,
        allowDangerousHTML: false,
    };

    constructor() {
        super();
        this.state = { allowNoImage: true };
    }

    shouldComponentUpdate(np, ns) {
        return np.text !== this.props.text ||
        np.large !== this.props.large ||
        // np.formId !== this.props.formId ||
        np.canEdit !== this.props.canEdit ||
        ns.allowNoImage !== this.state.allowNoImage;
    }

    onAllowNoImage = () => {
        this.setState({ allowNoImage: false });
    };

    render() {
        const { noImage } = this.props;
        const { allowNoImage } = this.state;
        let {text} = this.props;
        if (!text) text = ''; // text can be empty, still view the link meta data
        const { large, /*formId, canEdit, jsonMetadata,*/ highQualityPost } = this.props;

        let html = false;
        // See also ReplyEditor isHtmlTest
        const m = text.match(/^<html>([\S\s]*)<\/html>$/);
        if (m && m.length === 2) {
            html = true;
            text = m[1];
        } else {
            // See also ReplyEditor isHtmlTest
            html = /^<p>[\S\s]*<\/p>/.test(text);
        }

        // Strip out HTML comments. "JS-DOS" bug.
        text = text.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

        let renderedText = html ? text : remarkable.render(text);
        // Embed videos, link mentions and hashtags, etc...
        if(renderedText) renderedText = HtmlReady(renderedText).html;

        // Complete removal of javascript and other dangerous tags..
        // The must remain as close as possible to dangerouslySetInnerHTML
        let cleanText = renderedText;
        if (this.props.allowDangerousHTML === true) {
            console.log('WARN\tMarkdownViewer rendering unsanitized content');
        } else {
            cleanText = sanitize(renderedText, sanitizeConfig({large, highQualityPost, noImage: noImage && allowNoImage}))
        }

        if (/<\s*script/ig.test(cleanText)) {
            // Not meant to be complete checking, just a secondary trap and red flag (code can change)
            console.error('Refusing to render script tag in post text', cleanText);
            return (<div></div>);
        }

        const noImageActive = cleanText.indexOf(noImageText) !== -1;

        // In addition to inserting the youtube compoennt, this allows react to compare separately preventing excessive re-rendering.
        let idx = 0;
        const sections = [];

        // HtmlReady inserts ~~~ embed:${id} type ~~~
        for (let section of cleanText.split('~~~ embed:')) {
            const match = section.match(/^([A-Za-z0-9_-]+) (youtube|vimeo) ~~~/);
            if (match && match.length >= 3) {
                const id = match[1];
                const type = match[2];
                const w = large ? 640 : 480,
                      h = large ? 360 : 270;
                if (type === 'youtube') {
                    sections.push(
                        <Embed
                          id={id}
                          key={id}
                          placeholder={`https://img.youtube.com/vi/${id}/0.jpg`}
                          source='youtube'/>
                    );
                } else if(type === 'vimeo') {
                    const url = `https://player.vimeo.com/video/${id}`;
                    sections.push(
                        <div className='videoWrapper'>
                            <iframe key={idx++} src={url} title='Video' width={w} height={h} frameBorder='0'
                                webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
                        </div>
                    );
                } else {
                    console.error('MarkdownViewer unknown embed type', type);
                }
                section = section.substring(`${id} ${type} ~~~`.length);
                if (section === '') continue;
            }
            sections.push(<div key={idx++} dangerouslySetInnerHTML={{__html: section}} />);
        }

        const cn = 'Markdown' + (this.props.className ? ` ${this.props.className}` : '') + (html ? ' html' : '') + (large ? '' : ' MarkdownViewer--small');
        return (<div className={'MarkdownViewer ' + cn}>
            {sections}
            {noImageActive && allowNoImage &&
                <div onClick={this.onAllowNoImage} className='MarkdownViewer__negative_group'>
                    Images were hidden due to low ratings.
                    <button style={{marginBottom: 0}} className='button hollow tiny float-right'>Show</button>
                </div>
            }
        </div>);
    }
}

export default connect(
    (state, ownProps) => {
        return { ...ownProps };
    }
)(MarkdownViewer);
