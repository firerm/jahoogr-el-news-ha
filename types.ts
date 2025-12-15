export interface IntegrationConfig {
  name: string;
  domain: string;
  rssUrl: string;
  scanInterval: number;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  language: 'python' | 'json' | 'yaml';
  description: string;
}

export enum GeneratorStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}