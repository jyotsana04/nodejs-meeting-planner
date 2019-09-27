const mongoose = require('mongoose'),
Schema = mongoose.Schema;
const time = require('../libs/timeLib')

let meetingSchema = new Schema({
  meetingId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  title: {
    type: String,
    default: ''
  },
  start: {
    
    type: Date,
    default:Date.now
  },
  
  end: {
    type:Date,
    default:Date.now     
  },

  location:{
    type:String,
    default: ''
  },

  description: {
    type: String,
    default: ''
  },

  createdBy :{
    type:String,
    default:""
  },

  forUserId :{
    type:String,
    default:'',
    required: true
  }

})


mongoose.model('Meeting', meetingSchema);