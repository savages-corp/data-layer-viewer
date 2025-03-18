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
            parameters: {
              accessKeyId: '',
              secretAccessKey: '',
              region: 'us-east-1',
            },
          },
        },
        {
          label: 'Google Cloud Platform (GCP)',
          configuration: {
            identifier: 'GCP',
            type: ServiceType.GenericHypervisorGcp,
            parameters: {
              projectId: '',
              serviceAccountKey: '',
              zone: 'us-central1-a',
            },
          },
        },
        {
          label: 'Microsoft Azure',
          configuration: {
            identifier: 'Azure',
            type: ServiceType.GenericHypervisorAzure,
            parameters: {
              tenantId: '',
              clientId: '',
              clientSecret: '',
              subscriptionId: '',
            },
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
            parameters: {
              endpoint: 'https://api.example.com/graphql',
              authToken: '',
              headers: '',
            },
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
            parameters: {
              host: 'localhost',
              port: 5672,
              username: '',
              password: '',
              vhost: '/',
            },
          },
        },
        {
          label: 'NoSQL Database',
          configuration: {
            identifier: 'Generic NoSQL Service',
            type: ServiceType.GenericNoSql,
            parameters: {
              connectionString: 'mongodb://localhost:27017',
              database: '',
              username: '',
              password: '',
            },
          },
        },
        {
          label: 'SQL Database',
          configuration: {
            identifier: 'Generic SQL Service',
            type: ServiceType.GenericDatabase,
            parameters: {
              host: 'localhost',
              port: 5432,
              database: '',
              username: '',
              password: '',
              ssl: true,
            },
          },
        },
        {
          label: 'Data Warehouse',
          configuration: {
            identifier: 'Data Warehouse',
            type: ServiceType.GenericWarehouse,
            parameters: {
              warehouseUrl: '',
              accessKey: '',
              secretKey: '',
              region: 'us-east-1',
            },
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
            parameters: {
              apiKey: '',
              portalId: '',
              oauthToken: '',
            },
          },
        },
        {
          label: 'Mailchimp',
          configuration: {
            identifier: 'Mailchimp',
            type: ServiceType.CommonMailchimp,
            parameters: {
              apiKey: '',
              serverPrefix: 'us1',
              listId: '',
            },
          },
        },
        {
          label: 'Salesforce',
          configuration: {
            identifier: 'Salesforce',
            type: ServiceType.CommonSalesforce,
            parameters: {
              instanceUrl: '',
              consumerId: '',
              consumerSecret: '',
            },
          },
        },
        {
          label: 'Intercom',
          configuration: {
            identifier: 'Intercom',
            type: ServiceType.CommonIntercom,
            parameters: {
              accessToken: '',
              appId: '',
              apiVersion: '2.5',
            },
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
            parameters: {
              personalAccessToken: '',
              workspaceId: '',
              defaultProjectId: '',
            },
          },
        },
        {
          label: 'Jira',
          configuration: {
            identifier: 'Jira',
            type: ServiceType.CommonJira,
            parameters: {
              host: '',
              username: '',
              apiToken: '',
              projectKey: '',
            },
          },
        },
        {
          label: 'Slack',
          configuration: {
            identifier: 'Slack',
            type: ServiceType.CommonSlack,
            parameters: {
              botToken: '',
              signingSecret: '',
              appId: '',
            },
          },
        },
        {
          label: 'Zendesk',
          configuration: {
            identifier: 'Zendesk',
            type: ServiceType.CommonZendesk,
            parameters: {
              subdomain: '',
              email: '',
              apiToken: '',
              oauthToken: '',
            },
          },
        },
        {
          label: 'Trello',
          configuration: {
            identifier: 'Trello',
            type: ServiceType.CommonTrello,
            parameters: {
              apiKey: '',
              token: '',
              boardId: '',
              organizationId: '',
            },
          },
        },
        {
          label: 'ClickUp',
          configuration: {
            identifier: 'ClickUp',
            type: ServiceType.CommonClickup,
            parameters: {
              apiToken: '',
              teamId: '',
              spaceId: '',
              listId: '',
            },
          },
        },
        {
          label: 'Notion',
          configuration: {
            identifier: 'Notion',
            type: ServiceType.CommonNotion,
            parameters: {
              apiKey: '',
              databaseId: '',
              pageId: '',
              version: '2022-06-28',
            },
          },
        },
        {
          label: 'Miro',
          configuration: {
            identifier: 'Miro',
            type: ServiceType.CommonMiro,
            parameters: {
              accessToken: '',
              teamId: '',
              boardId: '',
              clientId: '',
            },
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
            parameters: {
              accessToken: '',
              owner: '',
              repo: '',
              baseUrl: 'https://api.github.com',
            },
          },
        },
        {
          label: 'GitLab',
          configuration: {
            identifier: 'GitLab',
            type: ServiceType.CommonGitlab,
            parameters: {
              privateToken: '',
              projectId: '',
              baseUrl: 'https://gitlab.com',
              apiVersion: 'v4',
            },
          },
        },
        {
          label: 'Vercel',
          configuration: {
            identifier: 'Vercel',
            type: ServiceType.CommonVercel,
            parameters: {
              token: '',
              teamId: '',
              projectId: '',
              deploymentUrl: '',
            },
          },
        },
        {
          label: 'Zapier',
          configuration: {
            identifier: 'Zapier',
            type: ServiceType.CommonZapier,
            parameters: {
              apiKey: '',
              webhookUrl: '',
              zapId: '',
            },
          },
        },
        {
          label: 'n8n',
          configuration: {
            identifier: 'n8n',
            type: ServiceType.CommonN8n,
            parameters: {
              apiKey: '',
              webhookUrl: '',
              baseUrl: 'http://localhost:5678',
              workflowId: '',
              username: '',
              password: '',
            },
          },
        },
        {
          label: 'CircleCI',
          configuration: {
            identifier: 'CircleCI',
            type: ServiceType.CommonCircleci,
            parameters: {
              token: '',
              projectSlug: '',
              orgName: '',
              vcsType: 'github',
            },
          },
        },
        {
          label: 'Jenkins',
          configuration: {
            identifier: 'Jenkins',
            type: ServiceType.CommonJenkins,
            parameters: {
              baseUrl: '',
              username: '',
              apiToken: '',
              jobName: '',
            },
          },
        },
        {
          label: 'Docker Hub',
          configuration: {
            identifier: 'Docker Hub',
            type: ServiceType.CommonDocker,
            parameters: {
              username: '',
              password: '',
              repository: '',
              registryUrl: 'https://index.docker.io/v1/',
            },
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
            parameters: {
              domain: '',
              clientId: '',
              clientSecret: '',
              audience: '',
            },
          },
        },
        {
          label: 'Okta',
          configuration: {
            identifier: 'Okta',
            type: ServiceType.CommonOkta,
            parameters: {
              orgUrl: '',
              token: '',
              clientId: '',
              clientSecret: '',
            },
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
            parameters: {
              secretKey: '',
              publishableKey: '',
              webhookSecret: '',
            },
          },
        },
        {
          label: 'Twilio',
          configuration: {
            identifier: 'Twilio',
            type: ServiceType.CommonTwilio,
            parameters: {
              accountSid: '',
              authToken: '',
              phoneNumber: '',
            },
          },
        },
        {
          label: 'PayPal',
          configuration: {
            identifier: 'PayPal',
            type: ServiceType.CommonPaypal,
            parameters: {
              clientId: '',
              clientSecret: '',
              environment: 'sandbox',
            },
          },
        },
      ],
    },
  ]
}
