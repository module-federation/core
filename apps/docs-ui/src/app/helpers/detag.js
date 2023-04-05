'use strict';

const TAG_ALL_RX = /<[^>]+>/g;

module.exports = (html) => html && html.replace(TAG_ALL_RX, '');
