export type CommonOptions = {
  config?: string;
  help?: boolean;
};

export type DtsOptions = {
  fetch?: boolean;
  generate?: boolean;
} & CommonOptions;
