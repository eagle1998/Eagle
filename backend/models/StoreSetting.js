const mongoose = require('mongoose');

const storeSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

storeSettingSchema.statics.get = async function (key) {
  const doc = await this.findOne({ key }).lean();
  return doc ? doc.value : null;
};

storeSettingSchema.statics.set = async function (key, value) {
  return this.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
};

storeSettingSchema.statics.getAllSettings = async function () {
  const docs = await this.find().lean();
  const result = {};
  for (const d of docs) result[d.key] = d.value;
  return result;
};

storeSettingSchema.statics.bulkSet = async function (entries) {
  const ops = entries.map(({ key, value }) => ({
    updateOne: { filter: { key }, update: { value }, upsert: true }
  }));
  await this.bulkWrite(ops);
};

module.exports = mongoose.model('StoreSetting', storeSettingSchema);
