import fse from 'fs-extra';
import { userConfigPath } from './path';

/**
 * @description Migrate previous extenion's setting
 */
export const applyUserConfigs = (userConfig: any, extensionInfo: any) => {
  const result = { ...extensionInfo };

  // Migrate previous variables
  if (userConfig.variables) {
    for (const variable of Object.keys(userConfig.variables)) {
      result.variables[variable] = userConfig.variables[variable];
    }
  }

  return result;
};

export const getUserConfigs = async () => {
  try {
    return await fse.readJSON(userConfigPath);
  } catch (err) {
    return {};
  }
};