import type { ConnectorConfig } from '../types/connector';

export interface Template {
  id: string;
  name: string;
  description: string;
  config: ConnectorConfig;
}

export const templates: Template[] = [
  {
    id: 'basic-connector',
    name: 'Basic Connector',
    description: 'Minimal connector configuration with a single GET request',
    config: {
      connector_name: 'My REST Connector',
      base_url: 'https://api.example.com/v1',
      default_headers: [
        { id: crypto.randomUUID(), name: 'Content-Type', value: 'application/json' },
        { id: crypto.randomUUID(), name: 'Accept', value: 'application/json' },
      ],
      auth: { type: 'bearer' },
      interface_parameters: [
        {
          id: crypto.randomUUID(),
          name: 'api_token',
          type: 'string',
          location: 'header',
          is_sensitive: true,
          map_to: '',
        },
      ],
      variables_metadata: { storage: 'file_system', results_dir: '', data_format: 'json' },
      steps: [
        {
          id: crypto.randomUUID(),
          type: 'rest',
          name: 'Get Data',
          description: 'Fetch data from the API',
          method: 'GET',
          endpoint: '/data',
          query_params: [],
          headers: [],
          body: '',
          content_type: 'application/json',
          variables_output: [
            {
              id: crypto.randomUUID(),
              variable_name: 'response_data',
              response_location: 'data',
              json_path: '$',
              format: 'json',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'cursor-pagination',
    name: 'Cursor Pagination',
    description: 'API connector with cursor-based pagination and token extraction',
    config: {
      connector_name: 'Paginated API Connector',
      base_url: 'https://api.example.com/v1',
      default_headers: [
        { id: crypto.randomUUID(), name: 'Content-Type', value: 'application/json' },
      ],
      auth: { type: 'bearer' },
      interface_parameters: [],
      variables_metadata: { storage: 'file_system', results_dir: '', data_format: 'json' },
      steps: [
        {
          id: crypto.randomUUID(),
          type: 'rest',
          name: 'Fetch Paginated Data',
          description: 'Fetch all pages of data using cursor-based pagination',
          method: 'GET',
          endpoint: '/items',
          query_params: [],
          headers: [],
          body: '',
          content_type: 'application/json',
          pagination: {
            type: 'cursor',
            page_param_name: '',
            page_size_param_name: '',
            start_value: 0,
            increment: 0,
            parameter_location: 'query',
            token_path: '$.links.next',
            total_items_path: '',
            break_conditions: [
              { id: crypto.randomUUID(), type: 'empty_response', key: '', value: '' },
            ],
          },
          variables_output: [
            {
              id: crypto.randomUUID(),
              variable_name: 'items',
              response_location: 'data',
              json_path: '$.data',
              format: 'json',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'external-variables-loop',
    name: 'External Variables Loop',
    description: 'Loop through external variables to process items from a source river',
    config: {
      connector_name: 'External Variables Connector',
      base_url: 'https://api.example.com/v1',
      default_headers: [
        { id: crypto.randomUUID(), name: 'Content-Type', value: 'application/json' },
      ],
      auth: { type: 'bearer' },
      interface_parameters: [],
      variables_metadata: { storage: 'file_system', results_dir: '', data_format: 'json' },
      steps: [
        {
          id: crypto.randomUUID(),
          type: 'rest',
          name: 'Get Items List',
          description: 'Fetch a list of items to iterate over',
          method: 'GET',
          endpoint: '/items',
          query_params: [],
          headers: [],
          body: '',
          content_type: 'application/json',
          variables_output: [
            {
              id: crypto.randomUUID(),
              variable_name: 'items_list',
              response_location: 'data',
              json_path: '$.data',
              format: 'json',
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          type: 'loop',
          name: 'Process Each Item',
          description: 'Iterate over items and fetch details for each',
          loop_type: 'data',
          items_path: 'items_list',
          item_name: 'current_item',
          include_in_output: true,
          ignore_errors: false,
          nested_steps: [
            {
              id: crypto.randomUUID(),
              type: 'rest',
              name: 'Get Item Details',
              description: 'Fetch details for the current item',
              method: 'GET',
              endpoint: '/items/{{%current_item%}}',
              query_params: [],
              headers: [],
              body: '',
              content_type: 'application/json',
              variables_output: [
                {
                  id: crypto.randomUUID(),
                  variable_name: 'item_details',
                  response_location: 'data',
                  json_path: '$',
                  format: 'json',
                },
              ],
            },
          ],
        },
      ],
    },
  },
];
