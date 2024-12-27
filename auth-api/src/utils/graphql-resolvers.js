const Test = require('../models/test');

const resolvers = {
  Query: {
    async tests() {
      return await Test.find();
    },
    async test(_, args) {
      return await Test.findById(args.id);
    },
  },
  Mutation: {
    async addTest(_, args) {
      const test = new Test(args.test);
      return await test.save();
    },
    async deleteTest(_, args) {
      await Test.findByIdAndDelete(args.id);
      return await Test.find();
    },
    async updateTest(_, args) {
      return await Test.findByIdAndUpdate(args.id, args.edits, { new: true });
    },
  },
};

module.exports = resolvers;
