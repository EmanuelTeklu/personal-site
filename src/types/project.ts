export interface SubProject {
  readonly name: string;
  readonly description: string;
  readonly port?: number;
}

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly description: string;
  readonly subprojects: readonly SubProject[];
}
