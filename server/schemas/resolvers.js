const { GraphQLError } = require("graphql");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id });

                return userData;
            }
            throw new GraphQLError("You must be logged in!");
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new GraphQLError("No user found with that email!");
            }

            const correctPW = await user.isCorrectPassword(password);
            if (!correctPW) {
                throw new GraphQLError("Password incorrect, please try again!");
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, args) => {
            try {
                const user = await User.create(args);
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                console.error(err);
                return null;
            }
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new GraphQLError("You must be logged in to save books!");
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new GraphQLError("You must be logged in to delete books!");
        },
    },
};

module.exports = resolvers;