const caseUtil = require('case');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

mkdirp.sync('./tsx');

const createSvgMap = () => {
    const map = {};
    const iconsPath = path.join(
        __dirname,
        '..',
        'node_modules',
        '@sb1',
        'ffe-icons',
        'icons',
    );
    fs.readdirSync(iconsPath)
        .filter(fileName => fileName.match(/\.svg$/))
        .forEach(fileName => {
            const iconPath = path.join(iconsPath, fileName);
            const iconName = fileName.split('.svg')[0];
            map[iconName] = fs.readFileSync(iconPath, 'utf-8');
        });
    return map;
};

/**
 * We have to expect dash-cased attributes in the SVG files from ffe-icons but React doesn't really
 * like those. A more solid approach to this would be preferable but on short term just handle the
 * three props we know exist in ffe-icons right now.
 *
 * Should this proplem (sic!) pop up more often, another solution should be sought
 * */
const toTsx = svgString => {
    const $ = cheerio.load(svgString, {
        xmlMode: true,
    });
    const svg = $('svg');
    // React does not support namespace definitions
    svg.attr('xmlns', null);
    svg.attr('xmlns:svg', null);

    return $.html()
        .replace(/fill-rule/g, 'fillRule')
        .replace(/stroke-width/g, 'strokeWidth')
        .replace(/stroke-miterlimit/g, 'strokeMiterlimit');
};

/**
 * Creates a new React component and a corresponding .tsx file for each icon
 * */
const createStandaloneTSX = (icons, iconName) => `
import * as React from 'react';
import * as PropTypes from 'prop-types';

const svg = ${toTsx(icons[iconName])};

interface IconProps extends Omit<React.SVGAttributes<SVGElement>, 'focusable'> {
    desc?: string;
    title?: string;
    focusable?: boolean | string;
    iconName?: string;
}

const Icon: React.FC<IconProps> = ({
    desc,
    title,
    iconName,
    ...rest
    }) => (
        <svg {...svg.props} {...rest}>
            {title &&
                <title>{title}</title>
            }
            {desc &&
                <desc>{desc}</desc>
            }
            {svg.props.children}
        </svg>
    );

Icon.propTypes = {
    desc: PropTypes.string,
    title: PropTypes.string,
    focusable: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf(['true', 'false', 'auto', 'undefined']),
    ]),
    iconName: PropTypes.string,
};

Icon.displayName = '${caseUtil.pascal(iconName)}';

export default Icon;
`;

const icons = createSvgMap();
Object.keys(icons).forEach(iconName =>
    fs.writeFileSync(
        `./tsx/${iconName}.tsx`,
        createStandaloneTSX(icons, iconName),
    ),
);

/**
 * Creates an index file that exports all icons
 */
const indexFileString = Object.keys(icons)
    .map(
        iconName =>
            `export { default as ${caseUtil.pascal(
                iconName,
            )} } from './${iconName}';`,
    )
    .join('\n');

fs.writeFileSync('./tsx/index.ts', indexFileString);
