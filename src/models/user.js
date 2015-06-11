/// <reference path="../../typings/mongoose/mongoose.d.ts" />
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
exports.userSchema = new mongoose.Schema({
    userName: { type: String, unique: true, trim: true, required: true },
    email: { type: String, lowercase: true, trim: true, required: true },
    password: { type: String },
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    resetToken: { type: String },
    modified: { type: Date }
});
exports.User = mongoose.model('User', exports.userSchema);
//# sourceMappingURL=user.js.map