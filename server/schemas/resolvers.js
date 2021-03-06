const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user){
            const userData = await User.findOne({ _id: context.user._id }).select('-password');
            return userData;
            }
            throw new AuthenticationError('Please login!')
        },
    },
    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email });
            if (!user) throw new AuthenticationError('User not found')
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Wrong Password!')
            }
            const token = signToken(user);
            return {token, user};
        },
        addUser: async (parent, args) => { 
            const user = await User.create(args);
            const token = signToken(user);
            console.log(user);
            return {token, user};
        },
        saveBook: async (parent, {bookData}, context) => {
            if (context.user){
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true}
                );
                return (updatedUser); 
            }
            throw new AuthenticationError('Please login');
        },
        removeBook: async (parent, {bookId}, context) => {
            if (context.user){
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId:bookId } } },
                    { new: true}
                );
                return (updatedUser); 
            }
            throw new AuthenticationError('Please login');
        },
    },
};
module.exports = resolvers;