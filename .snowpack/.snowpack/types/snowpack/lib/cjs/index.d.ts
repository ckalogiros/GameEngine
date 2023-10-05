import { CommandOptions, SnowpackConfig } from './types';
export * from './types';
export { startServer, NotFoundError } from './commands/dev';
export { build } from './commands/build';
export { loadConfiguration, createConfiguration } from './config.js';
export { readLockfile as loadLockfile } from './util.js';
export { clearCache } from './sources/util';
export { logger } from './logger';
export declare function getUrlForFile(fileLoc: string, config: SnowpackConfig): string | undefined;
export declare function preparePackages({ config }: CommandOptions): Promise<void>;
export declare function startDevServer(): void;
export declare function buildProject(): void;
export declare function loadAndValidateConfig(): void;
export declare function cli(args: string[]): Promise<never>;