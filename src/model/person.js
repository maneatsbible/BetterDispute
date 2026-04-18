/**
 * Model: Person
 *
 * Represents a GitHub user participating in Better Dispute.
 * The special "@strawman" user is the site owner who can have
 * assertions and challenges posted on their behalf.
 */

export const STRAWMAN_LOGIN = 'strawman'; // overridden by CONFIG.strawmanLogin at runtime

export class Person {
  /**
   * @param {number} id        GitHub user id
   * @param {string} login     GitHub login (no @)
   * @param {string} avatarUrl GitHub avatar URL
   */
  constructor(id, login, avatarUrl = '') {
    this.id        = id;
    this.login     = login;
    this.avatarUrl = avatarUrl;
  }

  /** True when this person is the configured strawman account. */
  isStrawman(strawmanLogin) {
    return this.login.toLowerCase() === strawmanLogin.toLowerCase();
  }

  /**
   * Factory: create a Person from a GitHub REST /user or /users/:login response.
   * @param {object} ghUser
   * @returns {Person}
   */
  static fromGitHubUser(ghUser) {
    return new Person(
      ghUser.id,
      ghUser.login,
      ghUser.avatar_url ?? ''
    );
  }
}
