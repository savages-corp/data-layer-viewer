import type { GroupedServiceOption } from '@/types/option'
import { ServiceType } from '@/types/service'

/**
 * Creates the grouped service options for the service selection dropdown
 * @param ti18n Translation function
 * @returns Array of grouped service options
 */
export function getServiceOptionsData(ti18n: any): GroupedServiceOption[] {
  return [
    {
      label: ti18n.translate(ti18n.keys.selectServiceCategoryHypervisor),
      options: [
        {
          label: 'Amazon Web Services (AWS)',
          configuration: {
            identifier: 'AWS',
            type: ServiceType.GenericHypervisorAws,
          },
        },
        {
          label: 'Google Cloud Platform (GCP)',
          configuration: {
            identifier: 'GCP',
            type: ServiceType.GenericHypervisorGcp,
          },
        },
        {
          label: 'Microsoft Azure',
          configuration: {
            identifier: 'Azure',
            type: ServiceType.GenericHypervisorAzure,
          },
        },
      ],
    },
    {
      label: ti18n.translate(ti18n.keys.selectServiceCategoryGeneric),
      options: [
        {
          label: 'GraphQL API',
          configuration: {
            identifier: 'Generic GraphQL Service',
            type: ServiceType.GenericGraphQL,
          },
        },
        {
          label: 'HTTP/S',
          configuration: {
            identifier: 'Generic HTTP/S Service',
            type: ServiceType.GenericHttp,
            parameters: {
              clientId: '',
              clientSecret: '',
              hostAddress: 'localhost',
              hostPort: 443,
              hostSecure: true,
              strict: true,
            },
          },
        },
        {
          label: 'Message Queue',
          configuration: {
            identifier: 'Generic Queue Service',
            type: ServiceType.GenericQueue,
          },
        },
        {
          label: 'NoSQL Database',
          configuration: {
            identifier: 'Generic NoSQL Service',
            type: ServiceType.GenericNoSql,
          },
        },
        {
          label: 'SQL Database',
          configuration: {
            identifier: 'Generic SQL Service',
            type: ServiceType.GenericDatabase,
          },
        },
        {
          label: 'Data Warehouse',
          configuration: {
            identifier: 'Data Warehouse',
            type: ServiceType.GenericWarehouse,
          },
        },
      ],
    },
    {
      label: ti18n.translate(ti18n.keys.selectServiceCategorySaasCrm),
      options: [
        {
          label: 'Hubspot',
          configuration: {
            identifier: 'Hubspot',
            type: ServiceType.CommonHubspot,
          },
        },
        {
          label: 'Mailchimp',
          configuration: {
            identifier: 'Mailchimp',
            type: ServiceType.CommonMailchimp,
          },
        },
        {
          label: 'Salesforce',
          configuration: {
            identifier: 'Salesforce',
            type: ServiceType.CommonSalesforce,
          },
        },
        {
          label: 'Intercom',
          configuration: {
            identifier: 'Intercom',
            type: ServiceType.CommonIntercom,
          },
        },
      ],
    },
    {
      label: ti18n.translate(ti18n.keys.selectServiceCategorySaasPm),
      options: [
        {
          label: 'Asana',
          configuration: {
            identifier: 'Asana',
            type: ServiceType.CommonAsana,
          },
        },
        {
          label: 'Jira',
          configuration: {
            identifier: 'Jira',
            type: ServiceType.CommonJira,
          },
        },
        {
          label: 'Slack',
          configuration: {
            identifier: 'Slack',
            type: ServiceType.CommonSlack,
          },
        },
        {
          label: 'Zendesk',
          configuration: {
            identifier: 'Zendesk',
            type: ServiceType.CommonZendesk,
          },
        },
        {
          label: 'Trello',
          configuration: {
            identifier: 'Trello',
            type: ServiceType.CommonTrello,
          },
        },
        {
          label: 'ClickUp',
          configuration: {
            identifier: 'ClickUp',
            type: ServiceType.CommonClickup,
          },
        },
        {
          label: 'Notion',
          configuration: {
            identifier: 'Notion',
            type: ServiceType.CommonNotion,
          },
        },
        {
          label: 'Miro',
          configuration: {
            identifier: 'Miro',
            type: ServiceType.CommonMiro,
          },
        },
      ],
    },
    {
      label: ti18n.translate(ti18n.keys.selectServiceCategorySaasDev),
      options: [
        {
          label: 'GitHub',
          configuration: {
            identifier: 'GitHub',
            type: ServiceType.CommonGithub,
          },
        },
        {
          label: 'GitLab',
          configuration: {
            identifier: 'GitLab',
            type: ServiceType.CommonGitlab,
          },
        },
        {
          label: 'Vercel',
          configuration: {
            identifier: 'Vercel',
            type: ServiceType.CommonVercel,
          },
        },
        {
          label: 'Zapier',
          configuration: {
            identifier: 'Zapier',
            type: ServiceType.CommonZapier,
          },
        },
        {
          label: 'CircleCI',
          configuration: {
            identifier: 'CircleCI',
            type: ServiceType.CommonCircleci,
          },
        },
        {
          label: 'Jenkins',
          configuration: {
            identifier: 'Jenkins',
            type: ServiceType.CommonJenkins,
          },
        },
        {
          label: 'Docker Hub',
          configuration: {
            identifier: 'Docker Hub',
            type: ServiceType.CommonDocker,
          },
        },
      ],
    },
    {
      label: ti18n.translate(ti18n.keys.selectServiceCategorySaasAuth),
      options: [
        {
          label: 'Auth0',
          configuration: {
            identifier: 'Auth0',
            type: ServiceType.CommonAuth0,
          },
        },
        {
          label: 'Okta',
          configuration: {
            identifier: 'Okta',
            type: ServiceType.CommonOkta,
          },
        },
      ],
    },
    {
      label: ti18n.translate(ti18n.keys.selectServiceCategorySaasPayment),
      options: [
        {
          label: 'Stripe',
          configuration: {
            identifier: 'Stripe',
            type: ServiceType.CommonStripe,
          },
        },
        {
          label: 'Twilio',
          configuration: {
            identifier: 'Twilio',
            type: ServiceType.CommonTwilio,
          },
        },
        {
          label: 'PayPal',
          configuration: {
            identifier: 'PayPal',
            type: ServiceType.CommonPaypal,
          },
        },
      ],
    },
  ]
}
