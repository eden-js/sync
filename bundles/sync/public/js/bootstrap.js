// Require dependencies
const uuid = require('uuid');
const Events = require('events');

// require local dependencies
const EdenModel = require('./model');
const Collection = require('sync/utils/collection');

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


  // ////////////////////////////////////////////////////////////////////////////
  //
  // QUERY METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////


  /**
   * queries for collection
   *
   * @param {String} collection
   * @param {String} listenerID
   */
  collection(collection, listenerID) {
    // query
    const query = {
      pts : [],
      collection,
      listenerID,
    };

    // query
    ['where', 'lt', 'gt', 'nin', 'in', 'elem', 'limit', 'sort'].forEach((type) => {
      // query type
      query[type] = (...args) => {
        // push type
        query.pts.push(type, args);

        // return query
        return query;
      };
    });

    // create find function
    const find = (one) => {
      // return created function
      return async () => {
        // results
        const results = await eden.router.post(`/api/${collection}/find`, {
          query : query.pts,
        });

        // map results to models
        return one ? this.get(collection, results[0].id, results[0], query.listenerID) : results.map((result) => {
          // return model
          return this.get(collection, result.id, result, query.listenerID);
        });
      };
    };

    // find
    query.find = find();
    query.findOne = find(true);
    query.listen = async () => {
      // listen to collection
      const subCollection = new Collection();

      // for each
      (await find()()).forEach((item) => {
        // set item
        subCollection.set(item.get('id'), item);
      });

      // set methods
      subCollection.uuid = uuid();
      subCollection.query = query.pts;
      subCollection.destroy = () => {
        // loop items
        subCollection.array().forEach((item) => {
          // remove listener
          item.listener.remove(listenerID);
        });

        // remove socket events
        socket.off(`collection.${subCollection.uuid}.model.add`);
        socket.off(`collection.${subCollection.uuid}.model.remove`);
      };

      // on model add
      socket.on(`collection.${subCollection.uuid}.model.add`, (model) => {
        // add model
        subCollection.set(model.id, this.get(collection, model.id, model, listenerID));
      });
      socket.on(`collection.${subCollection.uuid}.model.remove`, (model) => {
        // add model
        if (subCollection.get(model.id)) {
          // remove listener
          subCollection.get(model.id).listener.remove(listenerID);
        }

        // delete
        subCollection.delete(model.id);
      });
    };

    // create model
    query.create(async (opts) => {
      // fetch to backend
      const result = await eden.router.post(`/api/${collection}/create`, opts);

      // check data
      if (result.data) {
        // return got model
        return this.get(collection, result.data.id, result.data, listenerID);
      }
    });
  }
}

/**
 * Build alert class
 *
 * @type {edenAlert}
 */
const built = new ModelStore();

/**
 * Export locale store class
 *
 * @type {LocaleStore}
 */
module.exports = built;

/**
 * Add locale to window.eden
 */
window.eden.model = built;
