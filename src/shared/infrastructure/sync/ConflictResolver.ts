/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConflictData {
  local: any;
  remote: any;
  resolved?: any;
}

/**
 * Resolves conflicts when concurrent offline/online modifications collide.
 */
export class ConflictResolver {
  /**
   * Resolves conflicts based on a "last write wins" strategy.
   */
  public static resolveLastWriteWins<T extends { lastUpdated?: string | number }>(
    local: T,
    remote: T
  ): T {
    const localTime = local.lastUpdated ? new Date(local.lastUpdated).getTime() : 0;
    const remoteTime = remote.lastUpdated ? new Date(remote.lastUpdated).getTime() : 0;

    if (localTime >= remoteTime) {
      console.log("[ConflictResolver] Resolved in favor of local changes (Last Write Wins).");
      return local;
    } else {
      console.log("[ConflictResolver] Resolved in favor of remote changes (Last Write Wins).");
      return remote;
    }
  }

  /**
   * Custom strategy that combines data or prompts resolution.
   */
  public static merge<T>(local: T, remote: T): T {
    return {
      ...remote,
      ...local,
    };
  }
}
