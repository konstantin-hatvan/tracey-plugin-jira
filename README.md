# tracey-plugin-jira

Connector between Tracey and JIRA.

## Usage

Link requirements to jira using the frontmatter key `issue`.

### Installation

Install the plugin

`npm install tracey-plugin-jira --save-dev`

### Tracey configuration

Add the plugin to the project configuration

```js
// tracey.config.js

const JiraPlugin = require('tracey-plugin-jira');

module.exports = {
    plugins: [
        JiraPlugin.plugin({ /* configuration options */ }),
    ],
};
```

### Plugin configuration

The configuration object has the following options

#### property

**Default**: `issue`

Use this option to configure the frontmatter key for linking requirements

#### url

**Default**: `http://mytracker.com/issue`

Use this option to configure the URL of the JIRA instance
