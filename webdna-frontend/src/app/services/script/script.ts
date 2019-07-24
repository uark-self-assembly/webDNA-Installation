export class Script {
  id?: string;
  file_name: string;
  description: string;

  constructor(file_name?: string, description?: string) {
    this.file_name = file_name;
    this.description = description;
  }
}

export class ScriptChain {
  scripts: string[];
}
