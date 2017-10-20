'use strict';

const core = require('../../core');

const {assert, isDefined, isFunction} = require('@okwolo/utils')();

// the tags appearing in this map will be represented as singletons.
const singletons = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true,
};

// target is used as a callback for the string output of rendering the vdom object.
const renderToString = (target, _vdom) => {
    // string used to indent each level of the rendered dom.
    const indentString = '  ';
    assert(isFunction(target), 'server.dom.draw : target is not a function', target);
    // the return value of this function is an array of lines. the reason for
    // this is that nested tags need extra indentation and this function is
    // recursive. extra spaces can easily be appended to each line appearing
    // in the result of the render of a child.
    const render = (vdom = {text: ''})=> {
        if (isDefined(vdom.text)) {
            return [vdom.text];
        }
        // the input of this function can be assumed to be proper vdom syntax
        // since it has already been parsed and "transpiled" by the dom
        // module's "build" blob.
        let {tagName, attributes = {}, children = []} = vdom;
        const formattedAttributes = Object.keys(attributes)
            .map((key) => {
                // since the class attribute is written as className in the
                // vdom, a translation must be hardcoded.
                if (key === 'className') {
                    key = 'class';
                    attributes.class = attributes.className;
                }
                return `${key}="${attributes[key].toString()}"`;
            })
            .join(' ');
        // to correctly catch tags written with uppercase letters.
        tagName = tagName.toLowerCase();
        // early return in the case the element is a recognized singleton.
        // there it also checks that the element does not have descendents.
        if (isDefined(singletons[tagName]) && children.length < 1) {
            return [`<${`${tagName} ${formattedAttributes}`.trim()} />`];
        }
        const contents = children
            // cannot use a simple map because render returns an array of lines
            // which all need to be indented.
            .reduce((acc, child) => acc.concat(render(child)), [])
            .map((line) => indentString + line);
        return [
            `<${`${tagName} ${formattedAttributes}`.trim()}>`,
            ...contents,
            `</${tagName}>`,
        ];
    };
    target(render(_vdom).join('\n'));
};

// blob generating function that is expected in the configuration object.
const serverRender = ({use, emit}) => {
    use({
        draw: renderToString,
        update: renderToString,
        api: {
            setState: (state) => emit({state}),
        },
    });
};

module.exports = core({
    modules: [
        require('@okwolo/dom'),
        // the dom blob is still required to parse the shorthand vdom syntax.
        // since this kit is intended to be used on a server, the extra size
        // should not be a big problem. since the blobs are added sequentially,
        // the draw and update will be overwritten.
        require('@okwolo/dom/blob'),
        serverRender,
    ],
    options: {
        kit: 'server',
        browser: false,
    },
});