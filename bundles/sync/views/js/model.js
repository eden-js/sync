
// require uuid
const uuid = require('uuid');

// Require live model
const EdenModel = require('sync/public/js/model');

// create model mixin
module.exports = (mixIn) => {
  // models
  if (mixIn.__models) return;

  // set of models
  mixIn.__uuid = uuid();
  mixIn.__models = new Map();

  // create unbound updated
  const updated = () => {
    mixIn.safeUpdate();
  };

  // unmount
  mixIn.on('unmount', () => {
    // Create model
    if (!mixIn.eden.frontend) return;

    // loop models
    for (const [key, value] of mixIn.__models) {
      // remove view listner
      value.listener.remove(mixIn.__uuid);

      // On update
      value.removeListener('update', updated);

      // remove model
      mixIn.__models.delete(key);
    }
  });

  // create model function
  mixIn.model = (type, object) => {
    // check model listen exists already
    if (mixIn.__models.has(`${type}.${(object._id || object.id)}`)) {
      return mixIn.__models.get(`${type}.${(object._id || object.id)}`);
    }

    // check uuid
    if (!mixIn.__uuid) mixIn.__uuid = uuid();

    // Create model
    if (!mixIn.eden.frontend) {
      // create model
      const model = new EdenModel(type, (object._id || object.id), object);

      // Return model
      return model;
    }

    // return model
    const model = eden.model.add(type, (object._id || object.id), object, mixIn.__uuid);

    // add to models
    mixIn.__models.set(`${type}.${(object._id || object.id)}`, model);

    // On update
    model.on('update', updated);

    // Return model
    return model;
  };
};