import Service from '../Service.js';
import shell from 'shelljs';
import pkg from '../../../../package.json';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import { IConfiguration } from '../../../domain/configuration/interfaces/IConfiguration.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { configurationService, utilsService } from '../../../index.js';
import SetConfigurationService from './SetConfigurationService.js';

/**
 * Configuration Service
 */
export default class ConfigurationService extends Service {
  private configuration: IConfiguration;
  private configFileName = '.hedera-stable-coin-cli.yaml';
  private path = this.getDefaultConfigurationPath();

  constructor() {
    super('Configuration');
  }

  public async init(overrides?: IConfiguration, path?: string): Promise<void> {
    if (path) {
      this.path = path;
    }
    if (
      !fs.existsSync(this.getDefaultConfigurationPath()) ||
      !this.validateConfigurationFile()
    ) {
      const setConfigurationService: SetConfigurationService =
        new SetConfigurationService();
      await setConfigurationService.initConfiguration();
    }
    this.configuration = this.setConfigFromConfigFile();
    if (overrides?.defaultNetwork) {
      this.configuration.defaultNetwork = overrides.defaultNetwork;
    }
  }

  public getConfiguration(): IConfiguration {
    return this.configuration;
  }

  /**
   * Set the configuration and save to config file
   * @param _configuration
   * @param _path
   */
  public setConfiguration(
    _configuration: IConfiguration,
    _path?: string,
  ): void {
    this.configuration = _configuration;
    fs.writeFileSync(
      _path ?? this.getDefaultConfigurationPath(),
      yaml.dump(_configuration as unknown),
      'utf8',
    );
  }

  /**
   * Show full configuration in json format
   */
  public showFullConfiguration(): void {
    console.dir(this.getConfiguration(), { depth: null });
  }

  /**
   * Create default configuration file and override if exists
   */
  public createDefaultConfiguration(): void {
    try {
      const defaultConfig = yaml.load(
        fs.readFileSync(`src/resources/config/${this.configFileName}`, 'utf8'),
      );
      const filePath = this.getDefaultConfigurationPath();
      fs.ensureFileSync(filePath);
      fs.writeFileSync(filePath, yaml.dump(defaultConfig), 'utf8');
      configurationService.setConfiguration(defaultConfig);
    } catch (ex) {
      utilsService.showError(ex);
    }
  }

  /**
   * Set config data from config file
   */
  public setConfigFromConfigFile(): IConfiguration {
    const defaultConfigRaw = yaml.load(
      fs.readFileSync(this.getDefaultConfigurationPath(), 'utf8'),
    );
    const config: IConfiguration = {
      defaultNetwork: defaultConfigRaw['defaultNetwork'],
      networks: defaultConfigRaw['networks'] as unknown as INetworkConfig[],
      accounts: defaultConfigRaw['accounts'] as unknown as IAccountConfig[],
    };
    this.setConfiguration(config);
    return config;
  }

  /**
   * Get the default path for the configuration
   * @returns
   */
  public getDefaultConfigurationPath(): string {
    if (this.path) return this.path;
    shell.config.silent = true;
    const { stdout } = shell.exec('npm root -g');
    return `${stdout}/${pkg.name}/config/${this.configFileName}`.replace(
      /(\r\n|\n|\r)/gm,
      '',
    );
  }

  public validateConfigurationFile(): boolean {
    const config = yaml.load(
      fs.readFileSync(this.getDefaultConfigurationPath(), 'utf8'),
    );
    if (!config?.defaultNetwork) {
      return false;
    } else {
      return true;
    }
  }
}
