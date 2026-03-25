export type AuthType = 'bearer' | 'basic_http' | 'api_key' | 'oauth2';
export type OAuthGrantType = 'authorization_code' | 'client_credentials';
export type ParameterType = 'string' | 'authentication' | 'date_range' | 'list';
export type StepType = 'rest' | 'loop';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type PaginationType = 'page' | 'offset' | 'cursor';
export type StorageType = 'file_system' | 'memory';
export type VariableFormat = 'json' | 'text';
export type ResponseLocation = 'data' | 'headers' | 'status';
export type BreakConditionType = 'empty_response' | 'page_size_mismatch' | 'total_items_reached' | 'boolean_field';

export interface Header {
  id: string;
  name: string;
  value: string;
}

export interface OAuthConfig {
  grant_type: OAuthGrantType;
  token_url: string;
  refresh_token: string;
  use_base64: boolean;
}

export interface AuthConfig {
  type: AuthType;
  oauth?: OAuthConfig;
}

export interface InterfaceParameter {
  id: string;
  name: string;
  type: ParameterType;
  location: string;
  is_sensitive: boolean;
  map_to: string;
}

export interface VariablesMetadata {
  storage: StorageType;
  results_dir: string;
  data_format: VariableFormat;
}

export interface QueryParam {
  id: string;
  key: string;
  value: string;
}

export interface VariableOutput {
  id: string;
  variable_name: string;
  response_location: ResponseLocation;
  json_path: string;
  format: VariableFormat;
}

export interface BreakCondition {
  id: string;
  type: BreakConditionType;
  key: string;
  value: string;
}

export interface PaginationConfig {
  type: PaginationType;
  page_param_name: string;
  page_size_param_name: string;
  start_value: number;
  increment: number;
  parameter_location: string;
  token_path: string;
  total_items_path: string;
  break_conditions: BreakCondition[];
}

export interface RetryConfig {
  status_codes: string;
  attempts: number;
  interval: number;
}

export interface RestStep {
  id: string;
  type: 'rest';
  name: string;
  description: string;
  method: HttpMethod;
  endpoint: string;
  query_params: QueryParam[];
  headers: Header[];
  body: string;
  content_type: string;
  pagination?: PaginationConfig;
  retry?: RetryConfig;
  variables_output: VariableOutput[];
}

export interface LoopStep {
  id: string;
  type: 'loop';
  name: string;
  description: string;
  loop_type: string;
  items_path: string;
  item_name: string;
  include_in_output: boolean;
  ignore_errors: boolean;
  nested_steps: RestStep[];
  after_loop_step?: RestStep;
}

export type WorkflowStep = RestStep | LoopStep;

export interface ConnectorConfig {
  connector_name: string;
  base_url: string;
  default_headers: Header[];
  auth: AuthConfig;
  interface_parameters: InterfaceParameter[];
  variables_metadata: VariablesMetadata;
  steps: WorkflowStep[];
}

export const createDefaultConnector = (): ConnectorConfig => ({
  connector_name: '',
  base_url: '',
  default_headers: [],
  auth: {
    type: 'bearer',
  },
  interface_parameters: [],
  variables_metadata: {
    storage: 'file_system',
    results_dir: '',
    data_format: 'json',
  },
  steps: [],
});

export const createRestStep = (): RestStep => ({
  id: crypto.randomUUID(),
  type: 'rest',
  name: '',
  description: '',
  method: 'GET',
  endpoint: '',
  query_params: [],
  headers: [],
  body: '',
  content_type: 'application/json',
  variables_output: [],
});

export const createLoopStep = (): LoopStep => ({
  id: crypto.randomUUID(),
  type: 'loop',
  name: '',
  description: '',
  loop_type: 'data',
  items_path: '',
  item_name: '',
  include_in_output: false,
  ignore_errors: false,
  nested_steps: [createRestStep()],
});
