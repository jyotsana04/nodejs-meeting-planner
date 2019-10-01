'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  password: {
    type: String,

  },

  confirmPassword: {
    type: String
  },
  email: {
    type: String,
    default: ''
  },

  mobileNumber: {
    type: String,
    default: null
  },

  createdOn: {
    type: Date,
    default: ""
  },

  resetPasswordToken: {
    type: String,
    default: ''
  },

  resetPasswordExpires: {
    type: Date,
    default: ''
  },

  role: {
    type: String,
    default: 'normalUser'
  },
  userName: {
    type: String
  }


})


mongoose.model('User', userSchema);