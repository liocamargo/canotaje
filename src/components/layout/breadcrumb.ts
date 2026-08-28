export interface BreadcrumbExtra {
  label: string;
  onReset: () => void;
}

export type OnBreadcrumbChange = (extra: BreadcrumbExtra | null) => void;
