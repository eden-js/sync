// Require dependencies
import Events from 'events';

// require local dependencies
import EdenModel from './model';

/**
 * Create live model class
 *
 * @extends events
 */
class ModelStore extends Events {
  /**
   * Construct model class
   *
   * @param {String} type
   * @param {Object} object
   */
  constructor() {
    // Run super
    super();

    // set variables
    this.__models = new Map();

    // Build
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
  }


  /**
   * gets eden frontend live model
   *
   * @param  {String} type
   * @param  {String} id
   * @param  {Object} opts
   * @param  {String} listenID
   *
   * @return {EdenModel}
   */
  add(type, id, opts, listenID) {
    // set model
    if (!this.__models.has(type)) {
      // multi-dimensional map
      this.__models.set(type, new Map());
    }

    // check id
    if (!id) return new EdenModel(type, id, opts || {});

    // set id
    if (!id || !this.__models.get(type).has(id)) {
      // alter model
      this.__models.get(type).set(id, new EdenModel(type, id, opts || {}));
      this.__models.get(type).get(id).listener.add(listenID);

      // on remove
      this.__models.get(type).get(id).on('destroy', () => {
        // remove model
        this.__models.get(type).delete(id);
      });
    }

    // update model in place
    this.__models.get(type).get(id).setOpts(opts || {});

    // return model
    return this.__models.get(type).get(id);
  }

  /**
   * removes eden model
   *
   * @param  {String} type
   * @param  {String} id
   * @param  {String} listenID
   *
   * @return {*}
   */
  remove(type, id, listenID) {
    // set model
    if (!this.__models.has(type)) {
      // multi-dimensional map
      this.__models.set(type, new Map());
    }

    // set id
    if (!this.__models.get(type).has(id)) {
      // alter model
      this.__models.get(type).get(id).listener.remove(listenID);
    }

    // return removed
    return true;
  }
}

/**
 * Build alert class
 *
 * @type {edenAlert}
 */
const built = new ModelStore();

/**
 * Add locale to window.eden
 */
window.eden.model = built;

/**
 * Export locale store class
 *
 * @type {LocaleStore}
 */
export default built;
