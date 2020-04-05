// Require helper
const helper = require('helper');

/**
 * Create model helper
 *
 * @extends helper
 */
class ModelHelper extends helper {
  /**
   * Construct model helper
   */
  constructor() {
    // Run super
    super();

    // Bind methods
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);

    // create emitter
    this.emitter = this.eden.thread(['back', 'model']);
  }

  /**
   * add listener
   *
   * @param {*} on 
   * @param {*} opts 
   */
  addListener(on, opts) {
    // check model
    if (!on || !on.get('_id')) return;

    // Call local
    return this.emitter.call('model.listen', {
      userID    : opts.user ? opts.user.get('_id') : null,
      atomic    : !!opts.atomic,
      listenID  : opts.listenID,
      sessionID : opts.sessionID,
    }, on.constructor.name.toLowerCase(), on.get('_id').toString());
  }

  /**
   * add listener
   *
   * @param {*} on 
   * @param {*} opts 
   */
  removeListener(on, opts) {
    // check model
    if (!on || !on.get('_id')) return;

    // Call local
    return this.emitter.call('model.deafen', {
      userID    : opts.user ? opts.user.get('_id') : null,
      listenID  : opts.listenID,
      sessionID : opts.sessionID,
    }, on.constructor.name.toLowerCase(), on.get('_id').toString());
  }
}

/**
 * Export model helper
 *
 * @type {ModelHelper}
 */
module.exports = new ModelHelper();
