const visit  = require('unist-util-visit');
const { link, text, html, paragraph } = require('mdast-builder');

const defaultConfiguration = {
    property: 'issue',
    url: 'http://mytracker.com/issue'
};

const generateJiraBlock = (requirement, configuration) => ([
    html('<div class="tracey tracey-plugin-jira">'),
    generateIssueLinks(requirement, configuration),
    html('</div>'),
]);

const generateIssueLinks = (requirement, configuration) => {
    const issueIds = requirement[configuration.property].split(',').map((issueId) => issueId.trim());
    const issueLinks = issueIds.map(issueId => generateIssueLink(issueId, configuration));
    const commaSeparatedIssueLinks = issueLinks.flatMap((value, index, array) => array.length - 1 !== index
        ? [ value, text(', ') ]
        : value
    );

    return paragraph(commaSeparatedIssueLinks);
};

const generateIssueLink = (issueId, configuration) => {
    const url = generateIssueLinkHref(issueId, configuration);
    const title = issueId;
    const content = text(issueId);

    return link(url, title, content);
};

const generateIssueLinkHref = (issueId, configuration) => new URL(issueId, configuration.url);

const hasIssueProperty = (requirement, configuration) => Object.prototype.hasOwnProperty.call(requirement, configuration.property);

const updateIssueLinks = (requirement, configuration) => {
    const theRequirement = { ...requirement };
    const jiraBlock = generateJiraBlock(theRequirement, configuration);
    let shouldAddJiraLinkToTop = true;

    visit(theRequirement.ast, 'html', (node, index, parent) => {
        if (node.value === '<div class="tracey tracey-plugin-jira">') {
            parent.children.splice(index, jiraBlock.length, ...jiraBlock);
            shouldAddJiraLinkToTop = false;
        }
    });

    if (shouldAddJiraLinkToTop) {
        visit(theRequirement.ast, 'yaml', (node, index, parent) => {
            theRequirement.ast.children.splice(index + 1, 0, ...jiraBlock);
        });
    }

    return theRequirement;
};

const mergeConfiguration = (configurationInput, defaultConfiguration) => ({
    ...defaultConfiguration,
    ...configurationInput,
});

const plugin = (configuration = {}) => {
    const mergedConfiguration = mergeConfiguration(configuration, defaultConfiguration);
    return configuredPlugin(mergedConfiguration);
};

const removeIssueLinks = (original) => {
    const requirement = { ...original };

    visit(requirement.ast, 'html', (node, index, parent) => {
        if (node.value === '<div class="tracey tracey-plugin-jira">' && parent) {
            parent.children.splice(index, 3);
        }
    });

    return requirement;
};

const configuredPlugin = (configuration = defaultConfiguration) => ({ requirements, annotations }) => {
    const updatedRequirements = requirements.map(requirement => {
        if (hasIssueProperty(requirement, configuration)) {
            return updateIssueLinks(requirement, configuration);
        }

        return removeIssueLinks(requirement);
    });

    return {
        requirements: updatedRequirements,
        annotations,
    };
};

module.exports = {
    plugin,
};
