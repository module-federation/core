// Test provider with fallback version
// This file tests that fallbackVersion is used for filtering decisions

// These imports will determine what gets provided based on fallback version filtering
import React from 'react';
import Vue from 'vue';
import _ from 'lodash';

// React should be provided because fallbackVersion (18.2.0) satisfies include filter ^18.0.0
// even though actual version is 17.0.0

// Vue should NOT be provided because fallbackVersion (2.6.0) matches exclude filter ^2.0.0

// Lodash should NOT be provided because fallbackVersion (3.0.0) does not satisfy include filter ^4.0.0

export { React, Vue, _ };
