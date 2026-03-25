import { ExBadge, ExButton, BadgeColor, BadgeShape, BadgeSize, ButtonType, ButtonFlavor } from '@boomi/exosphere';
import { useTheme } from '../../hooks/useTheme';
import ThemeToggle from '../Layout/ThemeToggle';

interface UserStory {
  id: string;
  story: string;
  acceptance: string[];
}

interface Epic {
  id: number;
  name: string;
  description: string;
  color: BadgeColor;
  stories: UserStory[];
}

const epics: Epic[] = [
  {
    id: 1,
    name: 'Connector Configuration',
    description: 'Core connector setup including name, base URL, headers, and authentication',
    color: BadgeColor.BLUE,
    stories: [
      {
        id: 'US-1.1',
        story: 'As a user, I want to name my connector and set a base URL so I can identify and configure my API connection.',
        acceptance: [
          'Connector name field is visible and editable',
          'Base URL field accepts valid URLs',
          'Changes reflect immediately in the YAML output',
        ],
      },
      {
        id: 'US-1.2',
        story: 'As a user, I want to add default headers so every request includes necessary headers like Content-Type and Authorization.',
        acceptance: [
          'Can add multiple key-value header pairs',
          'Can edit existing headers inline',
          'Can delete individual headers',
          'Headers appear in the generated YAML',
        ],
      },
      {
        id: 'US-1.3',
        story: 'As a user, I want to configure authentication (Bearer Token, Basic HTTP, API Key, OAuth 2.0) so my API calls are authorized.',
        acceptance: [
          'Auth type dropdown with all 4 options',
          'Selecting auth type shows relevant sub-fields',
          'Auth configuration generates correct YAML structure',
        ],
      },
      {
        id: 'US-1.4',
        story: 'As a user, I want to set OAuth 2.0 details (grant type, token URL, refresh token, Base64 encoding) for OAuth-protected APIs.',
        acceptance: [
          'OAuth section appears only when auth type is OAuth 2.0',
          'Grant type options: Authorization Code, Client Credentials',
          'Token URL and Refresh Token fields',
          'Base64 encoding toggle',
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Interface Parameters',
    description: 'Input parameters that users of the connector will need to provide',
    color: BadgeColor.GREEN,
    stories: [
      {
        id: 'US-2.1',
        story: 'As a user, I want to define input parameters (string, auth, date_range, list) so users of my connector know what to provide.',
        acceptance: [
          'Can add new parameters with a name and type',
          'Parameter type options: String, Authentication, Date Range, List',
          'Parameters list shows all defined parameters',
        ],
      },
      {
        id: 'US-2.2',
        story: 'As a user, I want to mark parameters as sensitive/encrypted for secure credential handling.',
        acceptance: [
          'Toggle for sensitive/encrypted flag per parameter',
          'Sensitive parameters generate is_sensitive: true in YAML',
        ],
      },
      {
        id: 'US-2.3',
        story: 'As a user, I want to map parameters to different field names for flexibility.',
        acceptance: [
          'Optional "Map To" field per parameter',
          'Mapping generates map_to field in YAML output',
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Variables & Storage',
    description: 'Configuration for how pipeline variables are stored and formatted',
    color: BadgeColor.YELLOW,
    stories: [
      {
        id: 'US-3.1',
        story: 'As a user, I want to configure where variables are stored (file system vs. memory) to control data persistence.',
        acceptance: [
          'Storage type dropdown: File System, Memory',
          'Results directory field for file system storage',
        ],
      },
      {
        id: 'US-3.2',
        story: 'As a user, I want to define the data format for stored variables.',
        acceptance: [
          'Data format selection: JSON, Text',
          'Format choice reflected in YAML output',
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Workflow Steps',
    description: 'Building the data pipeline with REST API calls and loop iterations',
    color: BadgeColor.NAVY,
    stories: [
      {
        id: 'US-4.1',
        story: 'As a user, I want to add REST steps to make API calls with configurable method, URL, headers, params, and body.',
        acceptance: [
          'REST step form with Method (GET/POST/PUT/DELETE/PATCH)',
          'Endpoint URL field with variable placeholder support',
          'Query parameters, headers, and request body sections',
          'Content-Type configuration for POST/PUT/PATCH',
        ],
      },
      {
        id: 'US-4.2',
        story: 'As a user, I want to add Loop steps to iterate over data arrays from previous steps.',
        acceptance: [
          'Loop step with name, type, items path, and item name',
          'Loop type options: Data, External Variables',
          'Include in output and Ignore errors toggles',
        ],
      },
      {
        id: 'US-4.3',
        story: 'As a user, I want to nest REST steps inside loops to call APIs for each item in the iteration.',
        acceptance: [
          'Loop steps contain nested REST step forms',
          'Can add multiple nested steps',
          'Nested steps can reference loop item via {{%item_name%}}',
        ],
      },
      {
        id: 'US-4.4',
        story: 'As a user, I want to reorder, duplicate, and delete steps to organize my workflow.',
        acceptance: [
          'Move up/down buttons on each step',
          'Delete button with immediate removal',
          'Step order reflected in YAML output',
        ],
      },
      {
        id: 'US-4.5',
        story: 'As a user, I want to add descriptions to steps for documentation purposes.',
        acceptance: [
          'Description field on each step',
          'Description included in YAML when provided',
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Pagination',
    description: 'Handling paginated API responses with various strategies',
    color: BadgeColor.ORANGE,
    stories: [
      {
        id: 'US-5.1',
        story: 'As a user, I want to configure page-based pagination (page number, page size) for APIs that use page numbers.',
        acceptance: [
          'Page parameter name and size parameter name fields',
          'Start value and increment configuration',
          'Parameter location: Query, Headers, or Body',
        ],
      },
      {
        id: 'US-5.2',
        story: 'As a user, I want to configure offset-based pagination for APIs that use skip/limit.',
        acceptance: [
          'Offset pagination type option',
          'Same parameter fields as page-based',
        ],
      },
      {
        id: 'US-5.3',
        story: 'As a user, I want to configure cursor-based pagination (next token) for APIs that use continuation tokens.',
        acceptance: [
          'Cursor pagination type option',
          'Token path field (JSON path to next cursor)',
        ],
      },
      {
        id: 'US-5.4',
        story: 'As a user, I want to define break conditions to stop pagination when criteria are met.',
        acceptance: [
          'Break condition types: Empty Response, Page Size Mismatch, Total Items Reached, Boolean Field',
          'Can add multiple break conditions',
          'Key field for condition evaluation',
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Retry & Error Handling',
    description: 'Automatic retry strategies for handling API failures',
    color: BadgeColor.RED,
    stories: [
      {
        id: 'US-6.1',
        story: 'As a user, I want to add retry strategies with configurable status codes, attempts, and intervals.',
        acceptance: [
          'Enable/disable retry per step',
          'Status codes field (comma-separated)',
          'Max attempts and interval (seconds) fields',
        ],
      },
      {
        id: 'US-6.2',
        story: 'As a user, I want loop steps to optionally ignore errors and continue processing remaining items.',
        acceptance: [
          'Ignore errors toggle on loop steps',
          'When enabled, generates ignore_errors: true in YAML',
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Variable Outputs',
    description: 'Extracting and storing data from API responses',
    color: BadgeColor.GREEN,
    stories: [
      {
        id: 'US-7.1',
        story: 'As a user, I want to extract data from API responses using JSON path expressions.',
        acceptance: [
          'JSON path field with placeholder examples',
          'Supports standard JSON path syntax ($.data.users)',
        ],
      },
      {
        id: 'US-7.2',
        story: 'As a user, I want to store extracted data as variables for use in later steps.',
        acceptance: [
          'Variable name field',
          'Variables available via {{%variable_name%}} in subsequent steps',
        ],
      },
      {
        id: 'US-7.3',
        story: 'As a user, I want to choose response location (data, headers, status) and format (JSON, text).',
        acceptance: [
          'Response location dropdown: Data, Headers, Status',
          'Format dropdown: JSON, Text',
          'Both fields generate correct YAML structure',
        ],
      },
    ],
  },
  {
    id: 8,
    name: 'YAML Editor',
    description: 'Live YAML preview with bidirectional editing',
    color: BadgeColor.BLUE,
    stories: [
      {
        id: 'US-8.1',
        story: 'As a user, I want to see a live YAML preview that updates automatically as I configure the UI forms.',
        acceptance: [
          'YAML panel shows generated configuration',
          'Updates in real-time when form fields change',
        ],
      },
      {
        id: 'US-8.2',
        story: 'As a user, I want to edit YAML directly and have changes sync back to the UI forms.',
        acceptance: [
          'YAML editor is editable',
          'Changes sync to UI after a 1-second debounce',
          'Invalid YAML shows an error banner without corrupting UI state',
        ],
      },
      {
        id: 'US-8.3',
        story: 'As a user, I want to copy the generated YAML to clipboard with one click.',
        acceptance: [
          'Copy YAML button in editor header',
          'Copies full YAML text to clipboard',
          'Success feedback after copy',
        ],
      },
      {
        id: 'US-8.4',
        story: 'As a user, I want to paste existing YAML into the editor and have it populate the UI forms.',
        acceptance: [
          'Pasting YAML into editor triggers parsing',
          'Valid YAML populates all corresponding form fields',
          'Invalid YAML shows error without breaking the app',
        ],
      },
      {
        id: 'US-8.5',
        story: 'As a user, I want syntax highlighting and error indicators in the YAML editor.',
        acceptance: [
          'YAML syntax highlighting with proper colors',
          'Line numbers visible',
          'Error banner when YAML is invalid',
        ],
      },
      {
        id: 'US-8.6',
        story: 'As a user, I want to show/hide the YAML panel to maximize form space when needed.',
        acceptance: [
          'Toggle button in header to show/hide YAML panel',
          'Form area expands to full width when panel is hidden',
        ],
      },
    ],
  },
  {
    id: 9,
    name: 'Templates',
    description: 'Pre-built configurations for common integration patterns',
    color: BadgeColor.NAVY,
    stories: [
      {
        id: 'US-9.1',
        story: 'As a user, I want to select from pre-built templates to start configuring quickly.',
        acceptance: [
          'Templates button opens selection dialog',
          'Templates: Basic Connector, Cursor Pagination, External Variables Loop',
          'Selecting a template populates all fields',
        ],
      },
      {
        id: 'US-9.2',
        story: 'As a user, I want a warning before a template replaces my current configuration.',
        acceptance: [
          'Warning message visible in template dialog',
          'Cancel option available',
        ],
      },
    ],
  },
  {
    id: 10,
    name: 'UX & Responsiveness',
    description: 'Ensuring a great experience inside a drawer and across viewports',
    color: BadgeColor.GRAY,
    stories: [
      {
        id: 'US-10.1',
        story: 'As a user, I want the app to work well inside a drawer (~800px+ wide) in another application.',
        acceptance: [
          'All content accessible at 800px width',
          'No horizontal overflow',
          'Tab navigation works within drawer constraints',
        ],
      },
      {
        id: 'US-10.2',
        story: 'As a user, I want contextual help text and tooltips to understand each field without external documentation.',
        acceptance: [
          'Placeholder text with examples on all fields',
          'Help text on complex configurations',
        ],
      },
      {
        id: 'US-10.3',
        story: 'As a user, I want inline validation with clear error messages.',
        acceptance: [
          'YAML validation errors shown inline',
          'Error banner in YAML editor for parse failures',
        ],
      },
      {
        id: 'US-10.4',
        story: 'As a user, I want success/error toasts for actions like copy and template loading.',
        acceptance: [
          'Toast notification on successful copy',
          'Toast on template load',
          'Error toast on copy failure',
        ],
      },
    ],
  },
];

interface Props {
  onBack: () => void;
}

export default function UserStoriesPage({ onBack }: Props) {
  const totalStories = epics.reduce((sum, epic) => sum + epic.stories.length, 0);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="app-header-left">
          <ExButton type={ButtonType.TERTIARY} flavor={ButtonFlavor.BASE} onClick={onBack}>
            Back to Builder
          </ExButton>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>User Stories</span>
          <ExBadge color={BadgeColor.BLUE} shape={BadgeShape.ROUND}>
            {totalStories} stories
          </ExBadge>
        </div>
        <div className="app-header-right">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--exo-color-font-secondary, #666)',
            marginBottom: '24px',
            lineHeight: 1.6,
          }}>
            These user stories define the complete feature set of the Boomi Data Integration YAML Builder.
            Each story is organized by epic and includes acceptance criteria for verification.
          </p>

          {epics.map(epic => (
            <div key={epic.id} style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid var(--exo-color-border, #e0e0e0)',
              }}>
                <ExBadge color={epic.color} shape={BadgeShape.ROUND}>
                  Epic {epic.id}
                </ExBadge>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{epic.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--exo-color-font-secondary, #666)' }}>
                    {epic.description}
                  </div>
                </div>
              </div>

              {epic.stories.map(story => (
                <div key={story.id} style={{
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid var(--exo-color-border, #e0e0e0)',
                  borderRadius: '6px',
                  borderLeft: `3px solid`,
                  borderLeftColor: `var(--exo-color-${epic.color === BadgeColor.BLUE ? 'primary' : epic.color === BadgeColor.GREEN ? 'success' : epic.color === BadgeColor.RED ? 'error' : epic.color === BadgeColor.YELLOW ? 'warning' : 'border'}, #0066cc)`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                    <ExBadge color={BadgeColor.GRAY} shape={BadgeShape.SQUARED} size={BadgeSize.SMALL}>
                      {story.id}
                    </ExBadge>
                    <div style={{ fontSize: '14px', lineHeight: 1.5, flex: 1 }}>
                      {story.story}
                    </div>
                  </div>

                  <div style={{ marginLeft: '52px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--exo-color-font-secondary, #666)', marginBottom: '6px' }}>
                      Acceptance Criteria:
                    </div>
                    <ul style={{
                      fontSize: '13px',
                      color: 'var(--exo-color-font-secondary, #666)',
                      paddingLeft: '16px',
                      lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {story.acceptance.map((criteria, idx) => (
                        <li key={idx}>{criteria}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
