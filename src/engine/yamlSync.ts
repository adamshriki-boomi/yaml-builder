import { stringify, parse } from 'yaml';
import type { ConnectorConfig } from '../types/connector';

export function configToYaml(config: ConnectorConfig): string {
  try {
    const yamlObj: any = {};

    if (config.connector_name) yamlObj.connector_name = config.connector_name;
    if (config.base_url) yamlObj.base_url = config.base_url;

    // Default headers
    if (config.default_headers.length > 0) {
      yamlObj.default_headers = {};
      config.default_headers.forEach(h => {
        if (h.name) yamlObj.default_headers[h.name] = h.value;
      });
    }

    // Authentication
    if (config.auth.type) {
      yamlObj.auth = { type: config.auth.type };
      if (config.auth.type === 'oauth2' && config.auth.oauth) {
        yamlObj.auth.oauth = {
          grant_type: config.auth.oauth.grant_type,
          ...(config.auth.oauth.token_url ? { token_url: config.auth.oauth.token_url } : {}),
          ...(config.auth.oauth.refresh_token ? { refresh_token: config.auth.oauth.refresh_token } : {}),
          use_base64: config.auth.oauth.use_base64,
        };
      }
    }

    // Interface parameters
    if (config.interface_parameters.length > 0) {
      yamlObj.interface_parameters = config.interface_parameters.map(p => {
        const param: any = {
          name: p.name,
          type: p.type,
        };
        if (p.location) param.location = p.location;
        if (p.is_sensitive) param.is_sensitive = true;
        if (p.map_to) param.map_to = p.map_to;
        return param;
      });
    }

    // Variables metadata
    if (config.variables_metadata.storage || config.variables_metadata.results_dir) {
      yamlObj.variables_metadata = {
        storage: config.variables_metadata.storage,
        ...(config.variables_metadata.results_dir ? { results_dir: config.variables_metadata.results_dir } : {}),
        data_format: config.variables_metadata.data_format,
      };
    }

    // Steps
    if (config.steps.length > 0) {
      yamlObj.steps = config.steps.map(step => {
        if (step.type === 'rest') {
          return serializeRestStep(step);
        } else {
          const loopObj: any = {
            type: 'loop',
            name: step.name,
            ...(step.description ? { description: step.description } : {}),
            loop_type: step.loop_type,
            ...(step.items_path ? { items_path: step.items_path } : {}),
            ...(step.item_name ? { item_name: step.item_name } : {}),
            include_in_output: step.include_in_output,
            ignore_errors: step.ignore_errors,
          };
          if (step.nested_steps.length > 0) {
            loopObj.nested_steps = step.nested_steps.map(serializeRestStep);
          }
          return loopObj;
        }
      });
    }

    return stringify(yamlObj, { indent: 2, lineWidth: 0 });
  } catch (e) {
    return `# Error generating YAML: ${(e as Error).message}`;
  }
}

function serializeRestStep(step: any): any {
  const obj: any = {
    type: 'rest',
    name: step.name,
    ...(step.description ? { description: step.description } : {}),
    method: step.method,
    ...(step.endpoint ? { endpoint: step.endpoint } : {}),
  };

  if (step.query_params?.length > 0) {
    obj.query_params = {};
    step.query_params.forEach((p: any) => {
      if (p.key) obj.query_params[p.key] = p.value;
    });
  }

  if (step.headers?.length > 0) {
    obj.headers = {};
    step.headers.forEach((h: any) => {
      if (h.name) obj.headers[h.name] = h.value;
    });
  }

  if (step.body) obj.body = step.body;
  if (step.content_type && step.content_type !== 'application/json') {
    obj.content_type = step.content_type;
  }

  if (step.pagination) {
    obj.pagination = {
      type: step.pagination.type,
      parameter_location: step.pagination.parameter_location,
      ...(step.pagination.type === 'cursor'
        ? { token_path: step.pagination.token_path }
        : {
            page_param_name: step.pagination.page_param_name,
            page_size_param_name: step.pagination.page_size_param_name,
            start_value: step.pagination.start_value,
            increment: step.pagination.increment,
          }),
      ...(step.pagination.total_items_path ? { total_items_path: step.pagination.total_items_path } : {}),
    };
    if (step.pagination.break_conditions?.length > 0) {
      obj.pagination.break_conditions = step.pagination.break_conditions.map((c: any) => ({
        type: c.type,
        ...(c.key ? { key: c.key } : {}),
        ...(c.value ? { value: c.value } : {}),
      }));
    }
  }

  if (step.retry) {
    obj.retry = {
      status_codes: step.retry.status_codes,
      attempts: step.retry.attempts,
      interval: step.retry.interval,
    };
  }

  if (step.variables_output?.length > 0) {
    obj.variables_output = step.variables_output.map((v: any) => ({
      variable_name: v.variable_name,
      response_location: v.response_location,
      ...(v.json_path ? { json_path: v.json_path } : {}),
      format: v.format,
    }));
  }

  return obj;
}

export function yamlToConfig(yamlText: string): ConnectorConfig {
  const obj = parse(yamlText);
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid YAML format');
  }

  const config: ConnectorConfig = {
    connector_name: obj.connector_name || '',
    base_url: obj.base_url || '',
    default_headers: obj.default_headers
      ? Object.entries(obj.default_headers).map(([name, value]) => ({
          id: crypto.randomUUID(),
          name,
          value: String(value),
        }))
      : [],
    auth: {
      type: obj.auth?.type || 'bearer',
      ...(obj.auth?.oauth ? {
        oauth: {
          grant_type: obj.auth.oauth.grant_type || 'authorization_code',
          token_url: obj.auth.oauth.token_url || '',
          refresh_token: obj.auth.oauth.refresh_token || '',
          use_base64: obj.auth.oauth.use_base64 || false,
        },
      } : {}),
    },
    interface_parameters: (obj.interface_parameters || []).map((p: any) => ({
      id: crypto.randomUUID(),
      name: p.name || '',
      type: p.type || 'string',
      location: p.location || 'query',
      is_sensitive: p.is_sensitive || false,
      map_to: p.map_to || '',
    })),
    variables_metadata: {
      storage: obj.variables_metadata?.storage || 'file_system',
      results_dir: obj.variables_metadata?.results_dir || '',
      data_format: obj.variables_metadata?.data_format || 'json',
    },
    steps: (obj.steps || []).map((s: any) => deserializeStep(s)),
  };

  return config;
}

function deserializeStep(s: any): any {
  if (s.type === 'loop') {
    return {
      id: crypto.randomUUID(),
      type: 'loop',
      name: s.name || '',
      description: s.description || '',
      loop_type: s.loop_type || 'data',
      items_path: s.items_path || '',
      item_name: s.item_name || '',
      include_in_output: s.include_in_output || false,
      ignore_errors: s.ignore_errors || false,
      nested_steps: (s.nested_steps || []).map((ns: any) => deserializeRestStep(ns)),
    };
  }
  return deserializeRestStep(s);
}

function deserializeRestStep(s: any): any {
  return {
    id: crypto.randomUUID(),
    type: 'rest',
    name: s.name || '',
    description: s.description || '',
    method: s.method || 'GET',
    endpoint: s.endpoint || '',
    query_params: s.query_params
      ? Object.entries(s.query_params).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value: String(value),
        }))
      : [],
    headers: s.headers
      ? Object.entries(s.headers).map(([name, value]) => ({
          id: crypto.randomUUID(),
          name,
          value: String(value),
        }))
      : [],
    body: s.body || '',
    content_type: s.content_type || 'application/json',
    pagination: s.pagination ? {
      type: s.pagination.type || 'page',
      page_param_name: s.pagination.page_param_name || 'page',
      page_size_param_name: s.pagination.page_size_param_name || 'page_size',
      start_value: s.pagination.start_value ?? 1,
      increment: s.pagination.increment ?? 1,
      parameter_location: s.pagination.parameter_location || 'query',
      token_path: s.pagination.token_path || '',
      total_items_path: s.pagination.total_items_path || '',
      break_conditions: (s.pagination.break_conditions || []).map((c: any) => ({
        id: crypto.randomUUID(),
        type: c.type || 'empty_response',
        key: c.key || '',
        value: c.value || '',
      })),
    } : undefined,
    retry: s.retry ? {
      status_codes: s.retry.status_codes || '',
      attempts: s.retry.attempts || 3,
      interval: s.retry.interval || 10,
    } : undefined,
    variables_output: (s.variables_output || []).map((v: any) => ({
      id: crypto.randomUUID(),
      variable_name: v.variable_name || '',
      response_location: v.response_location || 'data',
      json_path: v.json_path || '',
      format: v.format || 'json',
    })),
  };
}
